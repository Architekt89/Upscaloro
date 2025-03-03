from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from typing import Optional, List, Dict, Any
import os
import logging
from backend.image_processor import ImageProcessor, VALID_MODES, VALID_SCALE_FACTORS, VALID_OUTPUT_FORMATS, MODE_TO_MODEL
from backend.auth import get_current_active_user, User
from backend.database import DatabaseHandler

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
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
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
                detail=error
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 