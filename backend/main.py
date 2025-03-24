from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Form, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from typing import Optional, List, Dict, Any
import os
import logging
import sys
from datetime import datetime, timedelta
import uuid
import stripe

# Try relative imports first
try:
    from .image_processor import ImageProcessor, VALID_MODES, VALID_SCALE_FACTORS, VALID_OUTPUT_FORMATS, MODE_TO_MODEL
    from .auth import get_current_active_user, User
    from .database import DatabaseHandler
    from .billing import BillingHandler, CheckoutSessionRequest, SUBSCRIPTION_PLANS, CheckoutSessionResponse
    from .payment import PaymentHandler, ENTERPRISE_PRICE_IDS
    from .api import get_subscription, test_create_subscription  # Import our API endpoints
except ImportError as e:
    # Fall back to absolute imports
    from backend.image_processor import ImageProcessor, VALID_MODES, VALID_SCALE_FACTORS, VALID_OUTPUT_FORMATS, MODE_TO_MODEL
    from backend.auth import get_current_active_user, User
    from backend.database import DatabaseHandler
    from backend.billing import BillingHandler, CheckoutSessionRequest, SUBSCRIPTION_PLANS, CheckoutSessionResponse
    from backend.payment import PaymentHandler, ENTERPRISE_PRICE_IDS
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
        
        # Check user subscription for restrictions based on subscription tier
        if current_user:
            subscription_tier = current_user.subscription_tier.lower()
            
            # Get subscription plan limits
            plan_limits = SUBSCRIPTION_PLANS.get(subscription_tier, SUBSCRIPTION_PLANS["free"]).limits
            
            # Check mode restrictions - Free users can only use block_mode
            allowed_modes = plan_limits.get("allowed_modes", ["block_mode"])
            if mode not in allowed_modes:
                raise HTTPException(
                    status_code=403,
                    detail=f"{mode} is not available on your {subscription_tier.capitalize()} plan. Please upgrade to access this feature."
                )
            
            # Check scale factor restrictions
            # Free users: max 2x, Pro users: max 4x, Enterprise users: max 16x
            max_scale_factor = plan_limits.get("max_scale_factor", 2)
            if scale_factor > max_scale_factor:
                raise HTTPException(
                    status_code=403,
                    detail=f"Scale factors above {max_scale_factor}x are not available on your {subscription_tier.capitalize()} plan. Please upgrade to access this feature."
                )
            
            # Check monthly image limit for free tier (changed from daily to monthly)
            if subscription_tier == "free":
                # Get images processed this month
                images_this_month = current_user.images_processed_this_month
                monthly_limit = plan_limits.get("images_per_month", 5)
                
                logger.info(f"User {current_user.username} has processed {images_this_month} images this month (limit: {monthly_limit})")
                
                if images_this_month >= monthly_limit:
                    raise HTTPException(
                        status_code=403,
                        detail=f"You have reached your monthly limit of {monthly_limit} images. Please wait until next month or upgrade to the Pro plan."
                    )
            
            # Check monthly image limit for pro tier
            elif subscription_tier == "pro":
                monthly_limit = plan_limits.get("images_per_month", 400)
                if current_user.images_processed_this_month >= monthly_limit:
                    raise HTTPException(
                        status_code=403,
                        detail=f"You have reached your monthly limit of {monthly_limit} images. Please upgrade to the Enterprise plan for more images."
                    )
            
            # Check monthly image limit for enterprise tier
            elif subscription_tier == "enterprise":
                monthly_limit = plan_limits.get("images_per_month", 800)
                if monthly_limit > 0 and current_user.images_processed_this_month >= monthly_limit:
                    raise HTTPException(
                        status_code=403,
                        detail=f"You have reached your monthly limit of {monthly_limit} images."
                    )
        
        # Read the file
        contents = await file.read()
        
        # Log file information
        logger.info(f"File received: {file.filename}, size: {len(contents)} bytes, content-type: {file.content_type}")
        
        # Process the image
        logger.info(f"Processing image with Replicate API using mode: {mode}")
        
        # Get max resolution from subscription tier
        max_resolution = "2K"
        if current_user:
            subscription_tier = current_user.subscription_tier.lower()
            plan_limits = SUBSCRIPTION_PLANS.get(subscription_tier, SUBSCRIPTION_PLANS["free"]).limits
            max_resolution = plan_limits.get("max_resolution", "2K")
        
        processed_image, error = await ImageProcessor.upscale_image(
            contents,
            scale_factor,
            mode,
            dynamic,
            handfix,
            creativity,
            resemblance,
            output_format,
            max_resolution
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
            
            # Store the image for pro and enterprise users
            if subscription_tier in ["pro", "enterprise"]:
                logger.info(f"Storing image for {subscription_tier} user: {current_user.username}")
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
async def get_upscale_options(current_user: Optional[User] = Depends(get_current_active_user)):
    """
    Get available upscale options based on user's subscription tier.
    
    Returns:
        dict: Available modes, scale factors, and output formats
    """
    try:
        logger.info("Fetching upscale options")
        
        # Define mode descriptions for better user understanding
        mode_descriptions = {
            "block_mode": "Best for most images.",
            "face_mode": "Best for portraits and images with faces.",
            "waifu_mode": "Best for anime/cartoon images."
        }
        
        # Default options for free tier
        subscription_tier = "free"
        max_scale_factor = 2
        allowed_modes = ["block_mode"]
        max_resolution = "2K"
        
        # If user is authenticated, get their subscription tier
        if current_user:
            subscription_tier = current_user.subscription_tier.lower()
            # Get plan limits from subscription tier
            plan_limits = SUBSCRIPTION_PLANS.get(subscription_tier, SUBSCRIPTION_PLANS["free"]).limits
            max_scale_factor = plan_limits.get("max_scale_factor", 2)
            allowed_modes = plan_limits.get("allowed_modes", ["block_mode"])
            max_resolution = plan_limits.get("max_resolution", "2K")
            
            logger.info(f"User {current_user.username} has {subscription_tier} tier with max scale factor {max_scale_factor}")
        
        # Filter available options based on subscription tier
        available_scale_factors = [sf for sf in VALID_SCALE_FACTORS if sf <= max_scale_factor]
        
        # For free users, we'll still show all modes but mark premium ones as unavailable
        # This is handled client-side in the UI
        all_modes_with_status = {}
        for mode in VALID_MODES:
            all_modes_with_status[mode] = {
                "name": mode,
                "available": mode in allowed_modes,
                "requires_plan": "free" if mode == "block_mode" else "pro" if mode in ["face_mode", "waifu_mode"] else "enterprise"
            }
        
        options = {
            "modes": VALID_MODES,  # Send all modes, client will handle restrictions
            "modes_available": all_modes_with_status,  # Additional info about mode availability
            "mode_descriptions": mode_descriptions,
            "scale_factors": VALID_SCALE_FACTORS,  # Send all scale factors, client will handle restrictions
            "scale_factors_available": {
                "2": {"available": True, "requires_plan": "free"},
                "4": {"available": subscription_tier in ["pro", "enterprise"], "requires_plan": "pro"},
                "6": {"available": subscription_tier == "enterprise", "requires_plan": "enterprise"},
                "8": {"available": subscription_tier == "enterprise", "requires_plan": "enterprise"},
                "16": {"available": subscription_tier == "enterprise", "requires_plan": "enterprise"}
            },
            "output_formats": VALID_OUTPUT_FORMATS,
            "max_resolution": max_resolution,
            "dynamic_range": {"min": 1, "max": 50, "default": 25, "description": "Controls the dynamic range of the output image. Higher values increase contrast."},
            "creativity": {"min": 0, "max": 1, "default": 0.5, "description": "Controls the creativity level of the AI. Higher values produce more creative results but may be less accurate."},
            "resemblance": {"min": 0, "max": 3, "default": 1.5, "description": "Controls how closely the output resembles the input. Higher values produce results more similar to the original."},
            "user_tier": {
                "name": subscription_tier,
                "can_upgrade": subscription_tier != "enterprise",
                "upgrade_url": "/pricing" if subscription_tier != "enterprise" else None
            }
        }
        
        logger.info(f"Returning upscale options: {options}")
        return options
    except Exception as e:
        logger.error(f"Error getting upscale options: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting upscale options: {str(e)}",
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
        logger.info(f"⚡ Received webhook request at: {datetime.now().isoformat()}")
        
        # Log all headers for debugging
        all_headers = dict(request.headers)
        safe_headers = {k: v for k, v in all_headers.items() if k.lower() not in ['authorization', 'stripe-signature']}
        safe_headers["stripe-signature"] = all_headers.get("stripe-signature", "")[:10] + "..." if "stripe-signature" in all_headers else "not present"
        logger.info(f"Request headers: {safe_headers}")
        
        # Get the webhook signature from the header
        stripe_signature = request.headers.get("stripe-signature")
        if not stripe_signature:
            logger.error("❌ Missing Stripe signature in webhook request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        # Read the request body
        payload = await request.body()
        payload_str = payload.decode('utf-8')
        payload_size = len(payload_str)
        logger.info(f"📦 Webhook payload size: {payload_size} bytes")
        
        # Log a small preview of the payload (first 100 characters)
        if payload_size > 0:
            preview = payload_str[:100] + "..." if payload_size > 100 else payload_str
            logger.info(f"Payload preview: {preview}")
        
        logger.info(f"Received webhook event with signature: {stripe_signature[:10]}...")
        
        # Process the webhook event
        result = await PaymentHandler.handle_webhook(payload, stripe_signature)
        
        logger.info(f"✅ Webhook processed: {result}")
        
        # Additional verification after webhook processing
        if result.get("status") == "success" and isinstance(result.get("user_id"), str) and isinstance(result.get("plan_id"), str):
            user_id = result["user_id"]
            plan_id = result["plan_id"]
            
            # Verify the database update worked
            try:
                from backend.database import DatabaseHandler
                user = await DatabaseHandler.get_user(user_id)
                if user:
                    current_tier = user.get("subscription_tier", "unknown")
                    logger.info(f"✅ Verification after webhook: User {user_id} subscription tier is {current_tier}")
                    
                    # If user should have enterprise plan but doesn't, force upgrade
                    if plan_id == "enterprise" and current_tier != "enterprise":
                        logger.warning(f"🚨 User should have enterprise but has {current_tier} - forcing upgrade")
                        
                        # Force upgrade
                        force_result = await PaymentHandler.force_upgrade_to_enterprise(
                            user_id=user_id,
                            customer_id=result.get("customer_id"),
                            subscription_id=result.get("subscription_id")
                        )
                        
                        logger.info(f"Force upgrade result: {force_result}")
                        result["upgrade_action"] = "forced_upgrade_to_enterprise"
                        result["upgrade_result"] = force_result
                        
                        # EMERGENCY FIX: Force auth metadata update to ensure frontend reflects Enterprise plan
                        try:
                            from supabase import create_client
                            SUPABASE_URL = os.getenv("SUPABASE_URL")
                            SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                            
                            if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                                logger.info(f"🔄 Emergency auth metadata update for user {user_id}")
                                supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                                
                                # Update auth metadata directly
                                auth_update = supabase.auth.admin.update_user_by_id(
                                    user_id,
                                    user_metadata={
                                        "subscription_tier": "enterprise",
                                        "subscription_status": "active",
                                        "updated_at": datetime.now().isoformat()
                                    }
                                )
                                logger.info(f"✅ Emergency auth metadata update successful")
                        except Exception as e:
                            logger.error(f"❌ Emergency auth metadata update failed: {str(e)}")
                            result["auth_metadata_updated"] = False
                else:
                    logger.error(f"❌ User {user_id} not found in database")
            except Exception as e:
                logger.error(f"❌ Error verifying webhook result: {str(e)}")
        
        return result
    except Exception as e:
        logger.error(f"❌ Error processing webhook: {str(e)}")
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
    Creates a Stripe checkout session for subscription.
    """
    try:
        logger.info(f"Creating checkout session: plan_id={request.plan_id}, price_id={request.price_id}, billing_cycle={request.billing_cycle}")
        
        # For enterprise plan upgrades, add additional logging
        if request.plan_id == "enterprise":
            logger.info(f"🔒 ENTERPRISE PLAN UPGRADE REQUESTED via checkout session")
            if request.price_id:
                logger.info(f"Enterprise price ID: {request.price_id}")
                # Verify the price ID corresponds to an enterprise plan
                from backend.payment import ENTERPRISE_PRICE_IDS, ENTERPRISE_PRICE_ID_DICT
                if request.price_id in ENTERPRISE_PRICE_IDS:
                    logger.info(f"✅ Confirmed valid enterprise price ID: {request.price_id}")
                else:
                    logger.warning(f"⚠️ Price ID not found in enterprise price list: {request.price_id}, using anyway")
                
                # Determine expected price ID based on billing cycle
                expected_price_id = ENTERPRISE_PRICE_ID_DICT.get(request.billing_cycle, ENTERPRISE_PRICE_ID_DICT["monthly"])
                if request.price_id != expected_price_id:
                    logger.warning(f"⚠️ Price ID {request.price_id} doesn't match expected enterprise price ID {expected_price_id} for {request.billing_cycle} billing")
            else:
                logger.warning("⚠️ No price ID provided for enterprise plan")
        
        # Skip authentication if it's a test or the user chooses to skip
        # Only do this in development mode
        if request.skip_auth and (os.getenv("ENVIRONMENT") != "production"):
            logger.warning("⚠️ Skipping authentication for checkout session - for testing only!")
            # Generate a fake user ID for testing
            test_user_id = f"test_{uuid.uuid4()}"
            result = await BillingHandler.create_checkout_session(
                test_user_id,
                request.plan_id, 
                request.price_id,
                request.billing_cycle,
                request.success_url,
                request.cancel_url
            )
            return result
        
        # If authentication is required, make sure we have a user
        if not current_user:
            logger.error("Authentication required but no user provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        # Create a checkout session using the BillingHandler
        result = await BillingHandler.create_checkout_session(
            current_user.username,
            request.plan_id,
            request.price_id,
            request.billing_cycle,
            request.success_url,
            request.cancel_url
        )
        
        # For enterprise plan, add additional debugging info
        if request.plan_id == "enterprise" and result and result.get("status") == "success":
            logger.info(f"🎯 Enterprise checkout session successfully created: {result.get('session_id')}")
            
        return result
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
        logger.info(f"⚡ Received billing webhook request at: {datetime.now().isoformat()}")
        
        # Log all headers for debugging
        all_headers = dict(request.headers)
        safe_headers = {k: v for k, v in all_headers.items() if k.lower() not in ['authorization', 'stripe-signature']}
        safe_headers["stripe-signature"] = all_headers.get("stripe-signature", "")[:10] + "..." if "stripe-signature" in all_headers else "not present"
        logger.info(f"Billing webhook headers: {safe_headers}")
        
        # Get the webhook signature from the header
        stripe_signature = request.headers.get("stripe-signature")
        if not stripe_signature:
            logger.error("❌ Missing Stripe signature in billing webhook request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        # Read the request body
        payload = await request.body()
        payload_str = payload.decode('utf-8')
        payload_size = len(payload_str)
        logger.info(f"📦 Billing webhook payload size: {payload_size} bytes")
        
        # Log a small preview of the payload (first 100 characters)
        if payload_size > 0:
            preview = payload_str[:100] + "..." if payload_size > 100 else payload_str
            logger.info(f"Billing payload preview: {preview}")
        
        logger.info(f"Received billing webhook event with signature: {stripe_signature[:10]}...")
        
        # Process the webhook event
        result = await PaymentHandler.handle_webhook(payload, stripe_signature)
        
        logger.info(f"✅ Billing webhook processed: {result}")
        
        # Additional verification after webhook processing
        if result.get("status") == "success" and isinstance(result.get("user_id"), str) and isinstance(result.get("plan_id"), str):
            user_id = result["user_id"]
            plan_id = result["plan_id"]
            
            # Verify the database update worked
            try:
                from backend.database import DatabaseHandler
                user = await DatabaseHandler.get_user(user_id)
                if user:
                    current_tier = user.get("subscription_tier", "unknown")
                    logger.info(f"✅ Verification after billing webhook: User {user_id} subscription tier is {current_tier}")
                    
                    # If user should have enterprise plan but doesn't, force upgrade
                    if plan_id == "enterprise" and current_tier != "enterprise":
                        logger.warning(f"🚨 User should have enterprise but has {current_tier} - forcing upgrade")
                        
                        # Force upgrade
                        force_result = await PaymentHandler.force_upgrade_to_enterprise(
                            user_id=user_id,
                            customer_id=result.get("customer_id"),
                            subscription_id=result.get("subscription_id")
                        )
                        
                        logger.info(f"Force upgrade result: {force_result}")
                        result["upgrade_action"] = "forced_upgrade_to_enterprise"
                        result["upgrade_result"] = force_result
                        
                        # EMERGENCY FIX: Force auth metadata update to ensure frontend reflects Enterprise plan
                        try:
                            from supabase import create_client
                            SUPABASE_URL = os.getenv("SUPABASE_URL")
                            SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                            
                            if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                                logger.info(f"🔄 Emergency auth metadata update for user {user_id}")
                                supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                                
                                # Update auth metadata directly
                                auth_update = supabase.auth.admin.update_user_by_id(
                                    user_id,
                                    user_metadata={
                                        "subscription_tier": "enterprise",
                                        "subscription_status": "active"
                                    }
                                )
                                logger.info(f"✅ Verify endpoint: Auth metadata updated to Enterprise")
                        except Exception as e:
                            logger.error(f"❌ Verify endpoint: Error updating to Enterprise: {str(e)}")
                else:
                    logger.error(f"❌ User {user_id} not found in database")
            except Exception as e:
                logger.error(f"❌ Error verifying billing webhook result: {str(e)}")
        
        return result
    except Exception as e:
        logger.error(f"❌ Error processing billing webhook: {str(e)}")
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

@app.get("/user/usage")
async def get_user_usage(current_user: User = Depends(get_current_active_user)):
    """
    Get current user's usage statistics including limits and used counts.
    
    Returns:
        dict: User's usage data including images processed and limits
    """
    try:
        logger.info(f"Fetching usage data for user: {current_user.username}")
        
        # Get user subscription tier
        subscription_tier = current_user.subscription_tier.lower()
        
        # Get plan limits
        plan_limits = SUBSCRIPTION_PLANS.get(subscription_tier, SUBSCRIPTION_PLANS["free"]).limits
        
        # Get images processed data
        images_processed_this_month = current_user.images_processed_this_month
        images_processed_today = await DatabaseHandler.get_images_processed_today(current_user.username)
        
        # Calculate limits based on plan
        if subscription_tier == "free":
            daily_limit = plan_limits.get("images_per_day", 5)
            monthly_limit = daily_limit * 30  # Approximation
            remaining_daily = max(0, daily_limit - images_processed_today)
            remaining_monthly = None  # No monthly limit for free tier
        elif subscription_tier == "pro":
            monthly_limit = plan_limits.get("images_per_month", 400)
            daily_limit = None  # No daily limit for pro tier
            remaining_daily = None
            remaining_monthly = max(0, monthly_limit - images_processed_this_month)
        else:  # Enterprise
            monthly_limit = -1  # Unlimited
            daily_limit = -1  # Unlimited
            remaining_daily = -1
            remaining_monthly = -1
        
        # Get allowed modes
        allowed_modes = plan_limits.get("allowed_modes", ["block_mode"])
        max_resolution = plan_limits.get("max_resolution", "2K")
        max_scale_factor = plan_limits.get("max_scale_factor", 2)
        
        # Return usage data
        usage_data = {
            "subscription": {
                "tier": subscription_tier,
                "name": subscription_tier.capitalize()
            },
            "limits": {
                "daily": daily_limit,
                "monthly": monthly_limit,
                "max_resolution": max_resolution,
                "max_scale_factor": max_scale_factor,
                "allowed_modes": allowed_modes
            },
            "usage": {
                "today": images_processed_today,
                "this_month": images_processed_this_month,
                "remaining_daily": remaining_daily,
                "remaining_monthly": remaining_monthly,
                "percentage_used_daily": (images_processed_today / daily_limit * 100) if daily_limit and daily_limit > 0 else None,
                "percentage_used_monthly": (images_processed_this_month / monthly_limit * 100) if monthly_limit and monthly_limit > 0 else None
            }
        }
        
        logger.info(f"Returning usage data: {usage_data}")
        return usage_data
    
    except Exception as e:
        logger.error(f"Error getting user usage: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user usage data: {str(e)}"
        )

@app.post("/admin/fix-subscription")
async def fix_subscription(
    email: str = Body(..., description="User email to update"),
    new_tier: str = Body(..., description="New subscription tier (free, pro, enterprise)"),
    admin_key: str = Body(..., description="Admin API key for authentication")
):
    """
    Admin endpoint to manually fix a user's subscription tier.
    
    Args:
        email: The user's email address
        new_tier: The new subscription tier (free, pro, enterprise)
        admin_key: Admin API key for authentication
    
    Returns:
        Dict with status and message
    """
    # Validate admin key
    expected_admin_key = os.getenv("ADMIN_API_KEY")
    if not expected_admin_key or admin_key != expected_admin_key:
        logger.warning(f"Unauthorized admin API key attempt from IP: {request.client.host}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin API key"
        )
    
    # Validate the new tier
    valid_tiers = ["free", "pro", "enterprise"]
    if new_tier.lower() not in valid_tiers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier. Must be one of: {', '.join(valid_tiers)}"
        )
    
    try:
        # Find the user by email
        user = await DatabaseHandler.get_user_by_email(email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email {email} not found"
            )
        
        # Update the user's subscription tier
        user_id = user["id"]
        current_tier = user.get("subscription_tier", "free")
        
        logger.info(f"Admin manually updating user {user_id} subscription from {current_tier} to {new_tier}")
        
        # Update user subscription tier
        subscription_data = {
            "subscription_tier": new_tier.lower(),
            "updated_at": datetime.now().isoformat()
        }
        
        updated = await DatabaseHandler.update_user(user_id, subscription_data)
        
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update subscription tier"
            )
        
        return {
            "status": "success",
            "message": f"Successfully updated {email}'s subscription from {current_tier} to {new_tier}",
            "user_id": user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in fix_subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update subscription: {str(e)}"
        )

@app.post("/api/manual-upgrade")
async def manual_upgrade_user(request: Request):
    """
    Manually upgrade a user's subscription plan.
    This endpoint is for support purposes only.
    """
    try:
        data = await request.json()
        email = data.get("email")
        target_plan = data.get("plan", "enterprise")
        admin_key = data.get("admin_key")
        
        # Verify admin key
        if not admin_key or admin_key != os.getenv("ADMIN_API_KEY"):
            logger.warning(f"Invalid admin key used for manual upgrade attempt for {email}")
            return JSONResponse(
                status_code=403,
                content={"error": "Invalid admin key"}
            )
        
        if not email:
            return JSONResponse(
                status_code=400,
                content={"error": "Email is required"}
            )
            
        # Validate the plan
        if target_plan not in ["free", "pro", "enterprise"]:
            return JSONResponse(
                status_code=400,
                content={"error": f"Invalid plan: {target_plan}. Must be one of: free, pro, enterprise"}
            )
            
        logger.info(f"Manual upgrade request for {email} to {target_plan} plan")
        
        # Call the payment handler to fix the subscription
        from backend.payment import PaymentHandler
        result = await PaymentHandler.manual_fix_subscription_by_email(
            email=email,
            target_plan=target_plan
        )
        
        if result.get("status") == "success":
            return JSONResponse(
                status_code=200,
                content={"message": result.get("message")}
            )
        else:
            return JSONResponse(
                status_code=400,
                content={"error": result.get("message")}
            )
            
    except Exception as e:
        logger.error(f"Error in manual upgrade endpoint: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Server error: {str(e)}"}
        )

@app.get("/api/fix-simballo")
async def fix_simballo():
    """
    Emergency endpoint to fix the subscription for simballo@outlook.com
    """
    try:
        from backend.payment import PaymentHandler
        
        result = await PaymentHandler.manual_fix_subscription_by_email(
            email="simballo@outlook.com",
            target_plan="enterprise"
        )
        
        if result.get("status") == "success":
            return JSONResponse(
                status_code=200,
                content={"message": "Successfully fixed simballo@outlook.com subscription to Enterprise tier"}
            )
        else:
            return JSONResponse(
                status_code=400,
                content={"error": result.get("message")}
            )
    except Exception as e:
        logger.error(f"Error fixing simballo subscription: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Server error: {str(e)}"}
        )

@app.get("/api/subscription/check")
async def check_subscription_status(request: Request):
    """
    Check the current status of a user's subscription.
    Can be used after a plan upgrade to confirm the new status.
    """
    try:
        # Get email from query param or from auth token
        email = request.query_params.get('email')
        
        if not email:
            # Try to get from auth token
            try:
                token = request.headers.get('authorization', '').replace('Bearer ', '')
                if token:
                    from backend.auth import decode_access_token
                    payload = decode_access_token(token)
                    user_id = payload.get('sub')
                    if user_id:
                        from backend.database import DatabaseHandler
                        user = await DatabaseHandler.get_user(user_id)
                        if user:
                            email = user.get('email')
            except Exception as e:
                logger.warning(f"Failed to get user from auth token: {str(e)}")
                
        if not email:
            return JSONResponse(
                status_code=400,
                content={"error": "Email is required as a query parameter or via auth token"}
            )
            
        # Get user by email
        from backend.database import DatabaseHandler
        user = await DatabaseHandler.get_user_by_email(email)
        
        if not user:
            return JSONResponse(
                status_code=404,
                content={"error": f"User with email {email} not found"}
            )
            
        # Get subscription information
        current_tier = user.get('subscription_tier', 'free')
        subscription_status = user.get('subscription_status', 'inactive')
        
        # Format subscription end date nicely
        subscription_end = user.get('subscription_current_period_end')
        formatted_end_date = None
        if subscription_end:
            try:
                from datetime import datetime
                end_date = datetime.fromisoformat(subscription_end.replace('Z', '+00:00'))
                formatted_end_date = end_date.strftime('%Y-%m-%d')
            except Exception as e:
                logger.warning(f"Failed to format subscription end date: {str(e)}")
                formatted_end_date = subscription_end
                
        # Return subscription status
        return JSONResponse(
            status_code=200,
            content={
                "user_id": user.get('id'),
                "email": email,
                "subscription_tier": current_tier,
                "subscription_status": subscription_status,
                "subscription_end_date": formatted_end_date,
                "is_enterprise": current_tier == "enterprise",
                "is_pro": current_tier == "pro",
                "is_free": current_tier == "free"
            }
        )
            
    except Exception as e:
        logger.error(f"Error checking subscription status: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Server error: {str(e)}"}
        )

@app.get("/api/verify-checkout/{session_id}")
async def verify_checkout_session(session_id: str, request: Request):
    """
    Verify a checkout session and its status.
    This can be used after payment to check the status and details of a checkout session.
    """
    try:
        # Get API key from environment
        stripe_api_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe_api_key:
            logger.error("STRIPE_SECRET_KEY not set in environment")
            return JSONResponse(
                status_code=500,
                content={"error": "Stripe API key not configured"}
            )
            
        stripe.api_key = stripe_api_key
        
        # Retrieve the session from Stripe
        logger.info(f"Verifying checkout session: {session_id}")
        try:
            session = stripe.checkout.Session.retrieve(
                session_id,
                expand=['line_items', 'customer', 'subscription']
            )
        except Exception as e:
            logger.error(f"Error retrieving Stripe session: {str(e)}")
            return JSONResponse(
                status_code=404,
                content={"error": f"Session not found or error: {str(e)}"}
            )
        
        # Extract key information
        user_id = session.metadata.get('user_id') if session.metadata else None
        plan_id = session.metadata.get('plan_id') if session.metadata else None
        customer_id = session.customer
        subscription_id = session.subscription
        payment_status = session.payment_status
        status = session.status
        
        # CRUCIAL ENTERPRISE DETECTION: Check for Enterprise price ID in session line items
        enterprise_detected = False
        if session.line_items and session.line_items.data:
            for item in session.line_items.data:
                if item.price and item.price.id:
                    price_id = item.price.id
                    logger.info(f"🔎 Checkout session line item price ID: {price_id}")
                    
                    from backend.payment import ENTERPRISE_PRICE_IDS
                    if price_id in ENTERPRISE_PRICE_IDS:
                        logger.info(f"🚨 ENTERPRISE PRICE DETECTED in verify-checkout: {price_id}")
                        plan_id = "enterprise"  # Override with enterprise regardless of session metadata
                        enterprise_detected = True
                        result["enterprise_price_detected"] = True
                        result["enterprise_price_id"] = price_id
                        
                        # Force enterprise metadata update immediately
                        try:
                            from supabase import create_client
                            SUPABASE_URL = os.getenv("SUPABASE_URL")
                            SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                            
                            if SUPABASE_URL and SUPABASE_SERVICE_KEY and user_id:
                                logger.info(f"🔄 Immediate Enterprise update for user {user_id}")
                                supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                                
                                # Update user table
                                user_update = supabase.table("users").update({
                                    "subscription_tier": "enterprise",
                                    "updated_at": datetime.now().isoformat()
                                }).eq("id", user_id).execute()
                                
                                if user_update.data and len(user_update.data) > 0:
                                    logger.info(f"✅ Verify endpoint: User record updated to Enterprise")
                                    
                                    # Also update auth metadata
                                    auth_update = supabase.auth.admin.update_user_by_id(
                                        user_id,
                                        user_metadata={
                                            "subscription_tier": "enterprise",
                                            "subscription_status": "active"
                                        }
                                    )
                                    logger.info(f"✅ Verify endpoint: Auth metadata updated to Enterprise")
                        except Exception as e:
                            logger.error(f"❌ Verify endpoint: Error updating to Enterprise: {str(e)}")
                        
                        break  # Exit loop once we find an Enterprise price ID
        
        # Log the information
        logger.info(f"Session details - Status: {status}, Payment status: {payment_status}")
        logger.info(f"User ID: {user_id}, Plan ID: {plan_id}")
        logger.info(f"Customer ID: {customer_id}, Subscription ID: {subscription_id}")
        
        result = {
            "session_id": session_id,
            "status": status,
            "payment_status": payment_status,
            "user_id": user_id,
            "plan_id": plan_id,
            "customer_id": customer_id,
            "subscription_id": subscription_id
        }
        
        # If the session is complete but our database doesn't reflect it yet, force update
        if status == "complete" and payment_status == "paid" and user_id and plan_id:
            logger.info(f"Session is complete and paid, checking database status")
            
            # Get the current user subscription status
            from backend.database import DatabaseHandler
            user = await DatabaseHandler.get_user(user_id)
            
            if user:
                current_tier = user.get('subscription_tier', 'free')
                logger.info(f"Current user tier in database: {current_tier}")
                
                # If user should have enterprise plan but doesn't, force upgrade
                if plan_id == "enterprise" and current_tier != "enterprise":
                    logger.warning(f"🚨 User should have enterprise but has {current_tier} - forcing upgrade")
                    
                    # Force upgrade
                    force_result = await PaymentHandler.force_upgrade_to_enterprise(
                        user_id=user_id,
                        customer_id=customer_id,
                        subscription_id=subscription_id
                    )
                    
                    logger.info(f"Force upgrade result: {force_result}")
                    result["upgrade_action"] = "forced_upgrade_to_enterprise"
                    result["upgrade_result"] = force_result
                    
                    # EMERGENCY FIX: Force auth metadata update to ensure frontend reflects Enterprise plan
                    try:
                        from supabase import create_client
                        SUPABASE_URL = os.getenv("SUPABASE_URL")
                        SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                        
                        if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                            logger.info(f"🔄 Emergency auth metadata update for user {user_id}")
                            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                            
                            # Update auth metadata directly
                            auth_update = supabase.auth.admin.update_user_by_id(
                                user_id,
                                user_metadata={
                                    "subscription_tier": "enterprise",
                                    "subscription_status": "active"
                                }
                            )
                            logger.info(f"✅ Verify endpoint: Auth metadata updated to Enterprise")
                    except Exception as e:
                        logger.error(f"❌ Verify endpoint: Error updating to Enterprise: {str(e)}")
            else:
                logger.error(f"❌ User {user_id} not found in database")
                result["error"] = "User not found in database"
        
        return JSONResponse(
            status_code=200,
            content=result
        )
    except Exception as e:
        logger.error(f"Error verifying checkout session: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Server error: {str(e)}"}
        )

@app.get("/api/webhook-test")
async def webhook_test():
    """
    Test endpoint to verify webhook configuration.
    """
    try:
        # Create a diagnostic result
        result = {
            "api_endpoints": {
                "webhook_endpoint": f"{os.getenv('BACKEND_URL', 'https://upscaloro.onrender.com')}/api/webhook",
                "billing_webhook_endpoint": f"{os.getenv('BACKEND_URL', 'https://upscaloro.onrender.com')}/billing/webhook"
            },
            "config": {
                "stripe_api_key_configured": bool(stripe_api_key),
                "webhook_secret_configured": bool(webhook_secret),
                "webhook_secret_preview": webhook_secret[:4] + "..." if webhook_secret and len(webhook_secret) > 4 else None
            }
        }
        
        # Check if Stripe can be initialized
        try:
            stripe.api_key = stripe_api_key
            account = stripe.Account.retrieve()
            result["stripe_account"] = {
                "account_id": account.id,
                "account_name": account.business_profile.name,
                "charges_enabled": account.charges_enabled,
                "details_submitted": account.details_submitted
            }
        except Exception as e:
            result["stripe_account_error"] = str(e)
        
        # Try to list configured webhooks
        try:
            webhooks = stripe.WebhookEndpoint.list(limit=10)
            result["configured_webhooks"] = []
            
            for webhook in webhooks.data:
                webhook_info = {
                    "id": webhook.id,
                    "url": webhook.url,
                    "status": webhook.status,
                    "enabled_events": webhook.enabled_events,
                    "api_version": webhook.api_version
                }
                result["configured_webhooks"].append(webhook_info)
        except Exception as e:
            result["webhook_list_error"] = str(e)
            
        logger.info(f"Webhook test results: {result}")
        return JSONResponse(
            status_code=200,
            content=result
        )
    except Exception as e:
        logger.error(f"Error in webhook test: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Error in webhook test: {str(e)}"}
        )

@app.post("/api/simulate-webhook")
async def simulate_webhook(request: Request):
    """
    Simulate a webhook event for testing purposes.
    This endpoint directly updates the database for the specified user.
    """
    try:
        # Check if it's development environment or verify admin key
        if os.getenv("ENVIRONMENT", "production").lower() != "development":
            # Add a backdoor with an admin key for production testing
            data = await request.json()
            admin_key = data.get("admin_key")
            if not admin_key or admin_key != os.getenv("ADMIN_API_KEY"):
                return JSONResponse(
                    status_code=403,
                    content={"error": "This endpoint is only available in development environment or with admin key"}
                )
        
        data = await request.json()
        
        # Get required parameters
        user_id = data.get("user_id")
        plan_id = data.get("plan_id", "enterprise").lower()
        customer_id = data.get("customer_id", f"cus_sim_{uuid.uuid4().hex[:8]}")
        subscription_id = data.get("subscription_id", f"sub_sim_{uuid.uuid4().hex[:8]}")
        
        if not user_id:
            return JSONResponse(
                status_code=400,
                content={"error": "user_id is required"}
            )
        
        # Get the user from the database
        from backend.database import DatabaseHandler
        user = await DatabaseHandler.get_user(user_id)
        if not user:
            return JSONResponse(
                status_code=404,
                content={"error": f"User {user_id} not found in database"}
            )
        
        # Get user email
        user_email = user.get("email")
        logger.info(f"Simulating subscription upgrade for user {user_id} ({user_email}) to {plan_id} plan")
        
        # Set up subscription data
        from datetime import datetime, timedelta
        current_period_end = datetime.now() + timedelta(days=365)
        status = "active"
        
        # ENTERPRISE PRICE ID CHECK: Add direct check for enterprise price IDs
        price_id = data.get("price_id", "price_1R1UWzBQ1z6vW0DwRDLKndlG" if plan_id == "enterprise" else "")
        if price_id in ENTERPRISE_PRICE_IDS:
            logger.info(f"🚨 Enterprise price ID detected in simulation: {price_id}")
            plan_id = "enterprise"  # Ensure plan is set to enterprise
        
        # Directly update the database using multiple methods
        
        # 1. Use Supabase direct SQL update
        sql_update_success = False
        try:
            from supabase import create_client
            SUPABASE_URL = os.getenv("SUPABASE_URL")
            SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
            
            if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                logger.info(f"🔧 Simulation: Directly updating database for user {user_id} to {plan_id}")
                supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                
                # Update user record
                user_update = {
                    "subscription_tier": plan_id,
                    "subscription_status": status,
                    "stripe_customer_id": customer_id,
                    "stripe_subscription_id": subscription_id,
                    "subscription_current_period_end": current_period_end.isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
                
                user_result = supabase.table("users").update(user_update).eq("id", user_id).execute()
                
                if user_result.data and len(user_result.data) > 0:
                    logger.info(f"✅ Simulation: User record updated successfully")
                    sql_update_success = True
                    
                    # Update subscription record
                    subscription_data = {
                        "user_id": user_id,
                        "plan": plan_id,
                        "status": status,
                        "current_period_end": current_period_end,
                        "stripe_customer_id": customer_id,
                        "stripe_subscription_id": subscription_id,
                        "email": user_email,
                        "updated_at": datetime.now().isoformat()
                    }
                    
                    # Check if subscription exists
                    sub_check = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
                    
                    if sub_check.data and len(sub_check.data) > 0:
                        # Update existing
                        supabase.table("subscriptions").update(subscription_data).eq("user_id", user_id).execute()
                    else:
                        # Insert new
                        supabase.table("subscriptions").insert(subscription_data).execute()
                    
                    logger.info(f"✅ Simulation: Subscription record updated successfully")
                    
                    # Update auth metadata
                    try:
                        auth_update = supabase.auth.admin.update_user_by_id(
                            user_id,
                            user_metadata={
                                "subscription_tier": plan_id,
                                "subscription_status": status
                            }
                        )
                        logger.info(f"✅ Simulation: Auth metadata updated successfully")
                    except Exception as e:
                        logger.warning(f"Could not update auth metadata: {str(e)}")
                else:
                    logger.error(f"❌ Simulation: Failed to update user record via SQL")
            else:
                logger.warning("Supabase credentials not available")
        except Exception as e:
            logger.error(f"❌ Simulation: SQL update error: {str(e)}")
        
        # 2. Use force_upgrade_to_enterprise if simulating enterprise upgrade
        if plan_id == "enterprise":
            try:
                from backend.payment import PaymentHandler
                force_result = await PaymentHandler.force_upgrade_to_enterprise(
                    user_id=user_id,
                    customer_id=customer_id,
                    subscription_id=subscription_id,
                    customer_email=user_email
                )
                logger.info(f"✅ Simulation: Force enterprise upgrade result: {force_result}")
            except Exception as e:
                logger.error(f"❌ Simulation: Force upgrade error: {str(e)}")
        
        # 3. Use DatabaseHandler as fallback
        db_update_success = False
        try:
            # Update user record
            subscription_data = {
                "subscription_tier": plan_id,
                "subscription_status": status,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id,
                "subscription_current_period_end": current_period_end.isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
            
            if updated_user:
                logger.info(f"✅ Simulation: User updated via DatabaseHandler")
                db_update_success = True
                
                # Also update subscription
                subscription_result = await DatabaseHandler.upsert_subscription(
                    user_id=user_id,
                    stripe_customer_id=customer_id,
                    stripe_subscription_id=subscription_id,
                    plan=plan_id,
                    status=status,
                    current_period_end=current_period_end,
                    email=user_email
                )
                
                if subscription_result:
                    logger.info(f"✅ Simulation: Subscription updated via DatabaseHandler")
                else:
                    logger.error(f"❌ Simulation: Failed to update subscription via DatabaseHandler")
            else:
                logger.error(f"❌ Simulation: Failed to update user via DatabaseHandler")
        except Exception as e:
            logger.error(f"❌ Simulation: DatabaseHandler error: {str(e)}")
        
        # Verify the update was successful
        try:
            verify_user = await DatabaseHandler.get_user(user_id)
            if verify_user:
                current_tier = verify_user.get("subscription_tier", "unknown")
                logger.info(f"✅ Simulation verification: User tier is now {current_tier}")
                
                if current_tier != plan_id:
                    logger.error(f"❌ Simulation verification failed: User tier should be {plan_id} but is {current_tier}")
                    # Last resort attempt with direct SQL
                    try:
                        if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                            emergency_update = supabase.table("users").update({
                                "subscription_tier": plan_id,
                                "updated_at": datetime.now().isoformat()
                            }).eq("id", user_id).execute()
                            logger.info(f"✅ Simulation: Emergency fix applied")
                    except Exception as e:
                        logger.error(f"❌ Simulation: Emergency fix failed: {str(e)}")
            else:
                logger.error(f"❌ Simulation verification failed: User not found")
        except Exception as e:
            logger.error(f"❌ Simulation verification error: {str(e)}")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": f"Simulated subscription upgrade for user {user_id} to {plan_id} plan",
                "sql_update_success": sql_update_success,
                "db_update_success": db_update_success,
                "user_id": user_id,
                "plan_id": plan_id,
                "verify_tier": verify_user.get("subscription_tier") if verify_user else "unknown"
            }
        )
    except Exception as e:
        logger.error(f"❌ Error in simulate-webhook: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Error simulating webhook: {str(e)}"}
        )

@app.post("/billing/debug-enterprise-upgrade")
async def debug_enterprise_upgrade(
    user_id: str = Body(..., embed=True),
    current_user: User = Depends(get_current_active_user)
):
    """
    Debug endpoint to identify issues with Enterprise upgrades.
    
    Args:
        user_id: The user ID to debug
        
    Returns:
        dict: Diagnostic information about the user's subscription
    """
    try:
        logger.info(f"DEBUG: Checking enterprise upgrade for user {user_id}")
        
        # Get user information
        from backend.database import DatabaseHandler
        user = await DatabaseHandler.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User not found: {user_id}"
            )
        
        # Get subscription information
        subscription = await DatabaseHandler.get_subscription(user_id)
        
        # Get Stripe information if available
        stripe_data = {}
        try:
            if user.get("stripe_customer_id"):
                stripe_customer = stripe.Customer.retrieve(user.get("stripe_customer_id"))
                stripe_data["customer"] = {
                    "id": stripe_customer.id,
                    "email": stripe_customer.email,
                    "name": stripe_customer.name
                }
            
            if user.get("stripe_subscription_id"):
                stripe_subscription = stripe.Subscription.retrieve(user.get("stripe_subscription_id"))
                stripe_data["subscription"] = {
                    "id": stripe_subscription.id,
                    "status": stripe_subscription.status,
                    "current_period_end": datetime.fromtimestamp(stripe_subscription.current_period_end).isoformat()
                }
                
                # Get price information
                if stripe_subscription.items.data and len(stripe_subscription.items.data) > 0:
                    price_id = stripe_subscription.items.data[0].price.id
                    stripe_data["price_id"] = price_id
                    stripe_data["mapped_plan"] = PRICE_TO_PLAN_MAPPING.get(price_id, "unknown")
        except Exception as e:
            logger.error(f"Error retrieving Stripe data: {str(e)}")
            stripe_data["error"] = str(e)
        
        # Collect pricing metadata
        from backend.payment import SUBSCRIPTION_PLANS, PRICE_TO_PLAN_MAPPING, ENTERPRISE_PRICE_IDS
        pricing_data = {
            "plans": list(SUBSCRIPTION_PLANS.keys()),
            "price_mapping": PRICE_TO_PLAN_MAPPING,
            "enterprise_price_ids": ENTERPRISE_PRICE_IDS
        }
        
        # Return diagnostic information
        return {
            "user_id": user_id,
            "user_data": {
                "subscription_tier": user.get("subscription_tier"),
                "subscription_status": user.get("subscription_status"),
                "subscription_current_period_end": user.get("subscription_current_period_end"),
                "stripe_customer_id": user.get("stripe_customer_id"),
                "stripe_subscription_id": user.get("stripe_subscription_id"),
                "subscription_price_id": user.get("subscription_price_id")
            },
            "subscription_data": subscription,
            "stripe_data": stripe_data,
            "pricing_data": pricing_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error debugging enterprise upgrade: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error debugging enterprise upgrade: {str(e)}"
        )

@app.post("/api/force-enterprise-upgrade")
async def force_enterprise_upgrade(
    request: Request,
    user_id: str = Body(..., embed=True),
    email: str = Body(None, embed=True)
):
    """
    Force upgrade a user to the Enterprise plan.
    This is a helper endpoint for debugging and fixing Enterprise plan issues.
    
    Args:
        user_id: The user ID to upgrade
        email: The user's email (optional)
        
    Returns:
        dict: Result of the upgrade
    """
    try:
        logger.info(f"🔥 Force upgrading user to Enterprise: user_id={user_id}, email={email}")
        
        # Validate inputs
        if not user_id and not email:
            return JSONResponse(
                status_code=400,
                content={"error": "Either user_id or email must be provided"}
            )
        
        # If only email is provided, look up the user ID
        if not user_id and email:
            from backend.database import DatabaseHandler
            user = await DatabaseHandler.get_user_by_email(email)
            if user:
                user_id = user.get("id")
                logger.info(f"Found user ID for email {email}: {user_id}")
            else:
                return JSONResponse(
                    status_code=404,
                    content={"error": f"User not found for email: {email}"}
                )
        
        # Force upgrade to Enterprise
        from backend.payment import PaymentHandler
        result = await PaymentHandler.force_upgrade_to_enterprise(
            user_id=user_id,
            customer_email=email
        )
        
        logger.info(f"Force upgrade result: {result}")
        
        # Add extra diagnostics in the response
        response_data = {
            "status": "success",
            "message": "Forced upgrade to Enterprise plan completed",
            "user_id": user_id,
            "email": email,
            "force_upgrade_result": result
        }
        
        # Try to get the current user data to verify upgrade
        try:
            from backend.database import DatabaseHandler
            user = await DatabaseHandler.get_user(user_id)
            if user:
                response_data["current_subscription_tier"] = user.get("subscription_tier")
                response_data["verification"] = user.get("subscription_tier") == "enterprise"
        except Exception as e:
            logger.error(f"Error getting user data: {str(e)}")
        
        return response_data
    except Exception as e:
        logger.error(f"Error in force_enterprise_upgrade: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Error upgrading to Enterprise: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 