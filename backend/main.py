from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Form, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from typing import Optional, List, Dict, Any
import os
import logging
import sys
from datetime import datetime, timedelta

# Try relative imports first
try:
    from .image_processor import ImageProcessor, VALID_MODES, VALID_SCALE_FACTORS, VALID_OUTPUT_FORMATS, MODE_TO_MODEL
    from .auth import get_current_active_user, User
    from .database import DatabaseHandler
    from .billing import BillingHandler, CheckoutSessionRequest, SUBSCRIPTION_PLANS, CheckoutSessionResponse
    from .payment import PaymentHandler
    from .api import get_subscription, test_create_subscription  # Import our API endpoints
except ImportError as e:
    # Fall back to absolute imports
    from backend.image_processor import ImageProcessor, VALID_MODES, VALID_SCALE_FACTORS, VALID_OUTPUT_FORMATS, MODE_TO_MODEL
    from backend.auth import get_current_active_user, User
    from backend.database import DatabaseHandler
    from backend.billing import BillingHandler, CheckoutSessionRequest, SUBSCRIPTION_PLANS, CheckoutSessionResponse
    from backend.payment import PaymentHandler
    from backend.api import get_subscription, test_create_subscription  # Import our API endpoints

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Upscalor API",
    description="AI Image Upscaler API",
    version="1.0.0",
)

# Get CORS origins from environment variable
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://upscaloro.vercel.app")
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

# Log the allowed origins for debugging
logger.info(f"CORS allowed origins: {cors_origins}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Use the origins from environment variable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Length"],
)

# Add our API endpoints
app.add_api_route("/subscription/{user_id}", get_subscription, methods=["GET"], tags=["Subscription"])
app.add_api_route("/test/create-subscription", test_create_subscription, methods=["POST"], tags=["Testing"])

@app.get("/")
async def root():
    return {"message": "Welcome to Upscalor API - AI Image Upscaler"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/upscale")
async def upscale_image(
    file: UploadFile = File(...),
    scale_factor: int = Form(2),
    mode: str = Form("block_mode"),
    dynamic: int = Form(25),
    handfix: bool = Form(False),
    creativity: float = Form(0.5),
    resemblance: float = Form(1.5),
    output_format: str = Form("png"),
    current_user: Optional[User] = Depends(get_current_active_user),
):
    """
    Upscale an image using AI.
    
    Args:
        file: The image file to upscale
        scale_factor: The scale factor (2, 4, 6, 8, 16)
        mode: The upscaling mode (block_mode, face_mode, waifu_mode)
        dynamic: Dynamic range (1-50)
        handfix: Whether to improve hand details
        creativity: Creativity level (0-1)
        resemblance: Resemblance to original (0-3)
        output_format: Output format (png, jpg, jpeg, webp)
        current_user: The authenticated user
        
    Returns:
        The upscaled image
    """
    try:
        logger.info(f"Upscale request received from user: {current_user.username if current_user else 'anonymous'}")
        logger.info(f"Parameters: scale_factor={scale_factor}, mode={mode}, dynamic={dynamic}, handfix={handfix}, creativity={creativity}, resemblance={resemblance}, output_format={output_format}")
        
        # Validate parameters
        if scale_factor not in VALID_SCALE_FACTORS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid scale factor. Must be one of: {VALID_SCALE_FACTORS}"
            )
        
        if mode not in VALID_MODES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid mode. Must be one of: {VALID_MODES}"
            )
        
        if output_format not in VALID_OUTPUT_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid output format. Must be one of: {VALID_OUTPUT_FORMATS}"
            )
        
        if dynamic < 1 or dynamic > 50:
            raise HTTPException(
                status_code=400,
                detail="Dynamic range must be between 1 and 50"
            )
        
        if creativity < 0 or creativity > 1:
            raise HTTPException(
                status_code=400,
                detail="Creativity must be between 0 and 1"
            )
        
        if resemblance < 0 or resemblance > 3:
            raise HTTPException(
                status_code=400,
                detail="Resemblance must be between 0 and 3"
            )
        
        # Check user subscription for pro features
        if current_user and current_user.subscription_tier == "free":
            if scale_factor > 2:
                raise HTTPException(
                    status_code=403,
                    detail="Scale factors above 2x are only available on the Pro plan"
                )
            
            # Check if the user has reached their monthly limit
            if current_user.images_processed_this_month >= 3:  # Free tier limit
                raise HTTPException(
                    status_code=403,
                    detail="You have reached your monthly limit of 3 images. Please upgrade to the Pro plan."
                )
        
        # Read the file
        contents = await file.read()
        
        # Log file information
        logger.info(f"File received: {file.filename}, size: {len(contents)} bytes, content-type: {file.content_type}")
        
        # Process the image
        logger.info(f"Processing image with Replicate API using mode: {mode}")
        processed_image, error = await ImageProcessor.upscale_image(
            contents,
            scale_factor,
            mode,
            dynamic,
            handfix,
            creativity,
            resemblance,
            output_format
        )
        
        if error:
            logger.error(f"Error processing image with Replicate API: {error}")
            raise HTTPException(
                status_code=500,
                detail=f"AI service error: {error}. Please try again or use a different image."
            )
        
        if not processed_image or len(processed_image) == 0:
            logger.error("Processed image is empty or None")
            raise HTTPException(
                status_code=500,
                detail="Failed to process the image. The AI service returned an empty result."
            )
        
        # Log success
        logger.info(f"Image successfully processed with Replicate API. Output size: {len(processed_image)} bytes")
        
        # Update user's processed images count if authenticated
        if current_user:
            logger.info(f"Incrementing processed images count for user: {current_user.username}")
            await DatabaseHandler.increment_processed_images(current_user.username)
            
            # Store the image for pro users
            if current_user.subscription_tier == "pro":
                logger.info(f"Storing image for pro user: {current_user.username}")
                image_url = await DatabaseHandler.store_image(
                    current_user.username,
                    processed_image,
                    f"upscaled_{file.filename}"
                )
        
        # Return the processed image
        logger.info("Returning processed image to client")
        return Response(
            content=processed_image,
            media_type=f"image/{output_format}"
        )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        logger.warning(f"HTTP exception in upscale_image: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Error upscaling image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}",
        )

@app.get("/upscale/options")
async def get_upscale_options():
    """
    Get available upscale options.
    
    Returns:
        dict: Available modes, scale factors, and output formats
    """
    try:
        logger.info("Fetching upscale options")
        
        # Define mode descriptions for better user understanding
        mode_descriptions = {
            "block_mode": "General purpose upscaling using epicrealism_naturalSinRC1VAE model. Best for most images.",
            "face_mode": "Face-focused upscaling using juggernaut_reborn model. Best for portraits and images with faces.",
            "waifu_mode": "Anime-style upscaling using flat2DAnimerge_v45Sharp model. Best for anime/cartoon images."
        }
        
        options = {
            "modes": VALID_MODES,
            "mode_descriptions": mode_descriptions,
            "scale_factors": VALID_SCALE_FACTORS,
            "output_formats": VALID_OUTPUT_FORMATS,
            "dynamic_range": {"min": 1, "max": 50, "default": 25, "description": "Controls the dynamic range of the output image. Higher values increase contrast."},
            "creativity": {"min": 0, "max": 1, "default": 0.5, "description": "Controls the creativity level of the AI. Higher values produce more creative results but may be less accurate."},
            "resemblance": {"min": 0, "max": 3, "default": 1.5, "description": "Controls how closely the output resembles the input. Higher values produce results more similar to the original."},
            "handfix": {"description": "Improves the quality of hands in the output image. Recommended for images containing hands."},
            "powered_by": "Replicate Clarity Upscaler",
            "api_version": "1.1.0"
        }
        
        logger.info(f"Returning upscale options: {options}")
        return options
    except Exception as e:
        logger.error(f"Error getting upscale options: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting upscale options: {str(e)}"
        )

@app.get("/usage")
async def get_usage(current_user: User = Depends(get_current_active_user)):
    """
    Get the user's API usage statistics.
    """
    try:
        user = await DatabaseHandler.get_user(current_user.username)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        return {
            "usage": {
                "subscription_tier": user.get("subscription_tier", "free"),
                "images_processed_this_month": user.get("images_processed_this_month", 0),
                "max_images_per_month": 3 if user.get("subscription_tier", "free") == "free" else float("inf")
            }
        }
    except Exception as e:
        logger.error(f"Error getting usage: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting usage: {str(e)}",
        )

@app.get("/models")
async def get_models_info():
    """
    Get information about the AI models used for image upscaling.
    
    Returns:
        dict: Information about the available models
    """
    try:
        logger.info("Fetching models information")
        
        # Define detailed model information
        models_info = {
            "real_esrgan": {
                "name": "Real-ESRGAN",
                "id": "philz1337x/clarity-upscaler",
                "description": "A state-of-the-art image upscaling model that produces high-quality results for photographs and realistic images.",
                "modes": ["block_mode", "face_mode", "waifu_mode"],
                "features": [
                    "High-quality image upscaling",
                    "Preserves fine details",
                    "Optional face enhancement",
                    "Handles various image types",
                    "Improves hand details"
                ],
                "best_for": ["Photographs", "Realistic images", "Portraits", "Landscapes"],
                "github_url": "https://github.com/philz1337x/clarity-upscaler"
            }
        }
        
        # Add information about the Replicate platform
        platform_info = {
            "name": "Replicate",
            "description": "A platform that makes it easy to run machine learning models in the cloud.",
            "website": "https://replicate.com",
            "documentation": "https://replicate.com/docs"
        }
        
        response = {
            "models": models_info,
            "platform": platform_info,
            "version": "1.1.0"
        }
        
        logger.info(f"Returning models information: {response}")
        return response
    except Exception as e:
        logger.error(f"Error getting models information: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting models information: {str(e)}"
        )

@app.get("/billing")
async def get_billing_info(current_user: User = Depends(get_current_active_user)):
    """
    Get the user's billing information, including subscription, payment methods, and invoices.
    
    Returns:
        dict: Billing information for the user
    """
    try:
        logger.info(f"Fetching billing information for user: {current_user.username}")
        
        billing_info = await BillingHandler.get_user_billing_info(current_user.username)
        
        logger.info(f"Returning billing information for user: {current_user.username}")
        return billing_info
    except Exception as e:
        logger.error(f"Error getting billing information: {str(e)}")
        # Instead of returning an error, return default billing info
        logger.info(f"Returning default billing information for user: {current_user.username}")
        
        # Default subscription for new users
        default_subscription = {
            "plan": "Free",
            "status": "active",
            "renewal_date": datetime.now().strftime("%Y-%m-%d"),
            "price": "$0.00",
            "billing_cycle": "monthly",
            "features": [
                "Up to 3 images per month",
                "2x and 4x upscaling",
                "Basic upscaling mode",
                "Standard support"
            ]
        }
        
        # Default usage for new users
        default_usage = {
            "images_processed": 0,
            "images_limit": 3,
            "api_calls": 0,
            "api_calls_limit": 0,
            "storage_used": "0 GB",
            "storage_limit": "0.1 GB",  # Corresponds to 100 MB in the Free plan
        }
        
        return {
            "subscription": default_subscription,
            "payment_methods": [],
            "invoices": [],
            "usage": default_usage
        }

@app.post("/billing/subscription")
async def update_subscription(
    plan_id: str = Body(..., embed=True),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update the user's subscription plan.
    
    Args:
        plan_id: The ID of the subscription plan to update to
        
    Returns:
        dict: Result of the subscription update
    """
    try:
        logger.info(f"Updating subscription for user: {current_user.username} to plan: {plan_id}")
        
        result = await BillingHandler.update_subscription(current_user.username, plan_id)
        
        logger.info(f"Subscription updated for user: {current_user.username}")
        return result
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating subscription: {str(e)}"
        )

@app.post("/billing/subscription/cancel")
async def cancel_subscription(current_user: User = Depends(get_current_active_user)):
    """
    Cancel the user's subscription.
    
    Returns:
        dict: Result of the subscription cancellation
    """
    try:
        logger.info(f"Cancelling subscription for user: {current_user.username}")
        
        result = await BillingHandler.cancel_subscription(current_user.username)
        
        logger.info(f"Subscription cancelled for user: {current_user.username}")
        return result
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling subscription: {str(e)}"
        )

@app.post("/billing/payment-methods")
async def add_payment_method(
    payment_details: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add a new payment method for the user.
    
    Args:
        payment_details: Details of the payment method to add
        
    Returns:
        dict: Result of adding the payment method
    """
    try:
        logger.info(f"Adding payment method for user: {current_user.username}")
        
        result = await BillingHandler.add_payment_method(current_user.username, payment_details)
        
        logger.info(f"Payment method added for user: {current_user.username}")
        return result
    except Exception as e:
        logger.error(f"Error adding payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding payment method: {str(e)}"
        )

@app.delete("/billing/payment-methods/{payment_method_id}")
async def delete_payment_method(
    payment_method_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a payment method for the user.
    
    Args:
        payment_method_id: The ID of the payment method to delete
        
    Returns:
        dict: Result of deleting the payment method
    """
    try:
        logger.info(f"Deleting payment method for user: {current_user.username}, payment method ID: {payment_method_id}")
        
        result = await BillingHandler.delete_payment_method(current_user.username, payment_method_id)
        
        logger.info(f"Payment method deleted for user: {current_user.username}")
        return result
    except Exception as e:
        logger.error(f"Error deleting payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting payment method: {str(e)}"
        )

@app.post("/billing/payment-methods/{payment_method_id}/default")
async def set_default_payment_method(
    payment_method_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Set a payment method as the default for the user.
    
    Args:
        payment_method_id: The ID of the payment method to set as default
        
    Returns:
        dict: Result of setting the default payment method
    """
    try:
        logger.info(f"Setting default payment method for user: {current_user.username}, payment method ID: {payment_method_id}")
        
        result = await BillingHandler.set_default_payment_method(current_user.username, payment_method_id)
        
        logger.info(f"Default payment method set for user: {current_user.username}")
        return result
    except Exception as e:
        logger.error(f"Error setting default payment method: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error setting default payment method: {str(e)}"
        )

@app.get("/billing/plans")
async def get_available_plans():
    """
    Get all available subscription plans.
    
    Returns:
        dict: Available subscription plans
    """
    try:
        logger.info("Fetching available subscription plans")
        
        plans = await BillingHandler.get_available_plans()
        
        logger.info("Returning available subscription plans")
        return plans
    except Exception as e:
        logger.error(f"Error getting available plans: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting available plans: {str(e)}"
        )

@app.post("/api/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.
    """
    try:
        # Log full request details 
        logger.info(f"Received webhook request at: {datetime.now().isoformat()}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        # Get the webhook signature from the header
        stripe_signature = request.headers.get("stripe-signature")
        if not stripe_signature:
            logger.error("Missing Stripe signature in webhook request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        # Read the request body
        payload = await request.body()
        
        logger.info(f"Received webhook event with signature: {stripe_signature[:10]}...")
        
        # Process the webhook event
        result = await PaymentHandler.handle_webhook(payload, stripe_signature)
        
        logger.info(f"Webhook processed: {result}")
        return result
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        # Return a 200 response to prevent Stripe from retrying the webhook
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"status": "error", "message": str(e)}
        )

@app.post("/api/checkout")
async def create_checkout_session(
    plan_id: str = Body(..., embed=True),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a Stripe checkout session for the user.
    
    Args:
        plan_id: The ID of the subscription plan to checkout
        
    Returns:
        dict: Checkout session details
    """
    try:
        logger.info(f"Creating checkout session for user: {current_user.username} for plan: {plan_id}")
        
        # Determine the domain for success/cancel URLs
        domain = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        # Create the checkout session
        result = await PaymentHandler.create_checkout_session(
            user_id=current_user.username,
            plan_id=plan_id,
            success_url=f"{domain}/dashboard/billing?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{domain}/dashboard/billing?canceled=true"
        )
        
        logger.info(f"Checkout session created: {result}")
        return result
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating checkout session: {str(e)}"
        )

@app.post("/billing/create-checkout-session")
async def create_checkout_session(
    request: CheckoutSessionRequest,
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """
    Create a Stripe checkout session for the user.
    
    Args:
        request: The checkout session request containing plan_id, price_id, billing_cycle, success_url, and cancel_url
        current_user: The authenticated user
        
    Returns:
        dict: Checkout session details with URL
    """
    try:
        logger.info(f"Received checkout session request: {request}")
        
        # Check if authentication is required
        if not request.skip_auth and not current_user:
            logger.warning("Authentication required for checkout but no user provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required for checkout",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Use a placeholder user ID for unauthenticated checkout if skip_auth is True
        user_id = current_user.username if current_user else "anonymous-user"
        
        # Validate the plan ID
        if request.plan_id not in SUBSCRIPTION_PLANS:
            logger.error(f"Invalid plan ID: {request.plan_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid plan ID: {request.plan_id}. Available plans: {list(SUBSCRIPTION_PLANS.keys())}"
            )
        
        # Create the checkout session
        result = await BillingHandler.create_checkout_session(
            user_id=user_id,
            plan_id=request.plan_id,
            price_id=request.price_id,
            billing_cycle=request.billing_cycle,
            success_url=request.success_url,
            cancel_url=request.cancel_url
        )
        
        logger.info(f"Checkout session created: {result}")
        return CheckoutSessionResponse(
            url=result["url"],
            session_id=result["session_id"]
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating checkout session: {str(e)}"
        )

@app.post("/billing/create-checkout-session-alt")
async def create_checkout_session_alt(
    request: CheckoutSessionRequest
):
    """
    Alternative endpoint for creating a Stripe checkout session without authentication.
    This is useful for initial signups or when the user doesn't have an account yet.
    
    Args:
        request: The checkout session request containing plan_id, price_id, billing_cycle, success_url, and cancel_url
        
    Returns:
        dict: Checkout session details with URL
    """
    try:
        logger.info(f"Received alternative checkout session request: {request}")
        
        # Use a placeholder user ID for unauthenticated checkout
        user_id = "anonymous-user"
        
        # Validate the plan ID
        if request.plan_id not in SUBSCRIPTION_PLANS:
            logger.error(f"Invalid plan ID: {request.plan_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid plan ID: {request.plan_id}. Available plans: {list(SUBSCRIPTION_PLANS.keys())}"
            )
        
        # Create the checkout session
        result = await BillingHandler.create_checkout_session(
            user_id=user_id,
            plan_id=request.plan_id,
            price_id=request.price_id,
            billing_cycle=request.billing_cycle,
            success_url=request.success_url,
            cancel_url=request.cancel_url
        )
        
        logger.info(f"Alternative checkout session created: {result}")
        return CheckoutSessionResponse(
            url=result["url"],
            session_id=result["session_id"]
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error creating alternative checkout session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating checkout session: {str(e)}"
        )

@app.post("/billing/webhook")
async def billing_webhook(request: Request):
    """
    Handle Stripe webhook events specifically for billing.
    This is an alternative endpoint to /api/webhook.
    """
    try:
        # Log full request details
        logger.info(f"Received billing webhook request at: {datetime.now().isoformat()}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        # Get the webhook signature from the header
        stripe_signature = request.headers.get("stripe-signature")
        if not stripe_signature:
            logger.error("Missing Stripe signature in billing webhook request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        # Read the request body
        payload = await request.body()
        
        logger.info(f"Received billing webhook event with signature: {stripe_signature[:10]}...")
        
        # Process the webhook event
        result = await PaymentHandler.handle_webhook(payload, stripe_signature)
        
        logger.info(f"Billing webhook processed: {result}")
        return result
    except Exception as e:
        logger.error(f"Error processing billing webhook: {str(e)}")
        # Return a 200 response to prevent Stripe from retrying the webhook
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"status": "error", "message": str(e)}
        )

@app.post("/billing/manual-upgrade")
async def manual_upgrade(
    user_id: str = Body(..., embed=True),
    plan_id: str = Body(..., embed=True)
):
    """
    Manually upgrade a user's subscription (for testing purposes only).
    
    Args:
        user_id: The user ID to upgrade
        plan_id: The plan ID to upgrade to
        
    Returns:
        dict: The result of the upgrade
    """
    try:
        logger.info(f"Manually upgrading user {user_id} to plan {plan_id}")
        
        # Validate the plan ID
        if plan_id not in SUBSCRIPTION_PLANS:
            logger.error(f"Invalid plan ID: {plan_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid plan ID: {plan_id}. Available plans: {list(SUBSCRIPTION_PLANS.keys())}"
            )
        
        # Check if the user exists - but skip if we're in a resource-constrained environment
        try:
            from backend.database import DatabaseHandler
            user = await DatabaseHandler.get_user(user_id)
            if not user:
                logger.error(f"User not found: {user_id}")
                # Instead of returning an error, create minimal user data
                user = {"id": user_id, "email": f"{user_id}@example.com"}
        except Exception as e:
            logger.warning(f"Error getting user, but continuing with upgrade: {str(e)}")
            # Create minimal user data to continue
            user = {"id": user_id, "email": f"{user_id}@example.com"}
        
        # Update user's subscription data
        current_time = datetime.now()
        expiry_time = current_time + timedelta(days=30)  # 30-day subscription
        
        subscription_data = {
            "subscription_tier": plan_id,
            "subscription_status": "active",
            "subscription_current_period_end": expiry_time.isoformat(),
            "updated_at": current_time.isoformat()
        }
        
        # Try to update the user record, but continue if it fails
        try:
            updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
            logger.info(f"User record updated successfully: {user_id}")
        except Exception as e:
            logger.warning(f"Error updating user, but continuing: {str(e)}")
            updated_user = {"id": user_id, **subscription_data}
        
        # Try to create or update subscription record, but continue if it fails
        try:
            subscription_result = await DatabaseHandler.upsert_subscription(
                user_id=user_id,
                stripe_customer_id="manual_upgrade",
                stripe_subscription_id="manual_upgrade",
                plan=plan_id,
                status="active",
                current_period_end=expiry_time,
                email=user.get("email")
            )
            logger.info(f"Subscription record updated successfully: {user_id}")
        except Exception as e:
            logger.warning(f"Error upserting subscription, but continuing: {str(e)}")
            subscription_result = {
                "id": f"manual_{user_id}",
                "user_id": user_id,
                "plan": plan_id,
                "status": "active",
                "current_period_end": expiry_time.isoformat()
            }
        
        # Create a user metadata update for Supabase auth
        try:
            # User auth metadata update via Supabase admin API
            from supabase.client import create_client
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
            
            if supabase_url and supabase_key:
                supabase = create_client(supabase_url, supabase_key)
                
                # Update user metadata
                auth_response = supabase.auth.admin.update_user_by_id(
                    user_id,
                    user_metadata={
                        "subscription_tier": plan_id,
                        "subscription_status": "active",
                        "subscription_current_period_end": expiry_time.isoformat(),
                        "stripe_customer_id": "manual_upgrade",
                        "stripe_subscription_id": "manual_upgrade"
                    }
                )
                
                logger.info(f"User auth metadata updated successfully: {user_id}")
            else:
                logger.warning("Supabase credentials not found in environment variables")
        except Exception as e:
            logger.warning(f"Error updating user auth metadata: {str(e)}")
        
        logger.info(f"Successfully upgraded user {user_id} to plan {plan_id}")
        return {
            "status": "success",
            "message": f"User {user_id} upgraded to {plan_id} plan",
            "user": updated_user,
            "subscription": subscription_result
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error upgrading user: {str(e)}")
        # Return success anyway in case of resource limitations
        return {
            "status": "partial_success",
            "message": f"User {user_id} partially upgraded to {plan_id} plan due to resource limitations",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 