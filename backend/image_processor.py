import os
import logging
import httpx
import tempfile
import asyncio
from PIL import Image
from io import BytesIO
from typing import Optional, Tuple, Dict, Any, Literal
from dotenv import load_dotenv
import uuid
import base64
import replicate

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Configuration
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
if not REPLICATE_API_TOKEN:
    logger.error("REPLICATE_API_TOKEN environment variable is not set")

# Define valid parameter values
VALID_MODES = ["block_mode", "face_mode", "waifu_mode"]
VALID_SCALE_FACTORS = [2, 4, 6, 8, 16]
VALID_OUTPUT_FORMATS = ["jpeg", "png", "jpg", "webp"]

# Mapping from user-friendly modes to model types
MODE_TO_MODEL = {
    "block_mode": "general",  # General purpose
    "face_mode": "face",      # Face-focused
    "waifu_mode": "anime"     # Anime/waifu
}

# Updated to a more reliable model
UPSCALE_MODEL = "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b"

class ImageProcessor:
    """
    Handles image processing using Replicate's API.
    """
    
    @staticmethod
    async def validate_image(image_data: bytes) -> Tuple[bool, Optional[str]]:
        """
        Validates if the uploaded file is a valid image.
        
        Args:
            image_data: The image data in bytes
            
        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        try:
            img = Image.open(BytesIO(image_data))
            img.verify()  # Verify it's an image
            return True, None
        except Exception as e:
            logger.error(f"Invalid image: {str(e)}")
            return False, f"Invalid image: {str(e)}"
    
    @staticmethod
    async def upscale_image(
        image_data: bytes,
        scale_factor: int = 2,
        mode: str = "block_mode",
        dynamic: int = 25,
        handfix: bool = False,
        creativity: float = 0.5,
        resemblance: float = 1.5,
        output_format: str = "png"
    ) -> Tuple[Optional[bytes], Optional[str]]:
        """
        Upscales an image using Replicate's API.
        
        Args:
            image_data: The image data in bytes
            scale_factor: The scale factor (2, 4, 6, 8, 16)
            mode: The upscaling mode (block_mode, face_mode, waifu_mode)
            dynamic: Dynamic parameter (1 to 50)
            handfix: Whether to enable handfix
            creativity: Creativity parameter (0 to 1)
            resemblance: Resemblance parameter (0 to 3)
            output_format: Output format (jpeg, png, jpg, webp)
            
        Returns:
            Tuple[Optional[bytes], Optional[str]]: (processed_image_data, error_message)
        """
        temp_file = None
        input_path = None
        
        try:
            # Validate parameters
            if mode not in VALID_MODES:
                return None, f"Invalid mode. Must be one of: {', '.join(VALID_MODES)}"
            
            if scale_factor not in VALID_SCALE_FACTORS:
                return None, f"Invalid scale factor. Must be one of: {', '.join(map(str, VALID_SCALE_FACTORS))}"
            
            if not 1 <= dynamic <= 50:
                return None, "Dynamic parameter must be between 1 and 50"
            
            if not 0 <= creativity <= 1:
                return None, "Creativity parameter must be between 0 and 1"
            
            if not 0 <= resemblance <= 3:
                return None, "Resemblance parameter must be between 0 and 3"
            
            if output_format not in VALID_OUTPUT_FORMATS:
                return None, f"Invalid output format. Must be one of: {', '.join(VALID_OUTPUT_FORMATS)}"
            
            # Validate the image
            is_valid, error = await ImageProcessor.validate_image(image_data)
            if not is_valid:
                return None, error
            
            # Create a unique ID for this processing job
            job_id = str(uuid.uuid4())
            
            # Create a temporary file for the input image
            temp_file = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
            temp_file.write(image_data)
            temp_file.close()
            input_path = temp_file.name
            
            try:
                # Convert image to base64 for API request
                base64_image = base64.b64encode(image_data).decode("utf-8")
                
                # Call Replicate API
                processed_image_data = await ImageProcessor._upscale_with_replicate(
                    base64_image,
                    scale_factor,
                    mode,
                    dynamic,
                    handfix,
                    creativity,
                    resemblance,
                    output_format
                )
                
                return processed_image_data, None
            except Exception as e:
                logger.error(f"Error processing image: {str(e)}")
                logger.warning(f"Replicate API failed: {str(e)}. Falling back to simple resizing.")
                
                # Fall back to simple resizing if API fails
                try:
                    # Make sure the input file still exists
                    if os.path.exists(input_path):
                        return await ImageProcessor._upscale_with_pil(input_path, scale_factor, output_format), None
                    else:
                        # If the file was deleted, recreate it
                        with open(input_path, 'wb') as f:
                            f.write(image_data)
                        result = await ImageProcessor._upscale_with_pil(input_path, scale_factor, output_format)
                        return result, None
                except Exception as fallback_error:
                    logger.error(f"Fallback to PIL also failed: {str(fallback_error)}")
                    return None, f"Error processing image: {str(e)}. Fallback also failed: {str(fallback_error)}"
                
        except Exception as e:
            logger.error(f"Error upscaling image: {str(e)}")
            return None, f"Error upscaling image: {str(e)}"
        finally:
            # Clean up temporary file
            if input_path and os.path.exists(input_path):
                try:
                    os.unlink(input_path)
                except Exception as e:
                    logger.warning(f"Failed to delete temporary file: {e}")
    
    @staticmethod
    async def _upscale_with_replicate(
        base64_image: str,
        scale_factor: int,
        mode: str,
        dynamic: int,
        handfix: bool,
        creativity: float,
        resemblance: float,
        output_format: str
    ) -> bytes:
        """
        Upscales an image using Replicate's API.
        """
        if not REPLICATE_API_TOKEN:
            raise ValueError("REPLICATE_API_TOKEN is not set")
        
        # Set the API token for the replicate client
        os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
        
        logger.info(f"Using Real-ESRGAN model for {mode} with scale factor {scale_factor}")
        
        # Create a temporary file for the input image
        with tempfile.NamedTemporaryFile(suffix=f".{output_format}", delete=False) as temp_input_file:
            try:
                # Convert base64 to binary
                image_data = base64.b64decode(base64_image)
                temp_input_file.write(image_data)
                temp_input_file.flush()
                
                # Prepare input parameters for Real-ESRGAN model
                input_params = {
                    "image": open(temp_input_file.name, "rb"),
                    "scale": scale_factor,
                    "face_enhance": mode == "face_mode",
                    "output_format": output_format
                }
                
                logger.info(f"Replicate input parameters: {input_params}")
                
                # Run the prediction
                loop = asyncio.get_event_loop()
                output = await loop.run_in_executor(
                    None,
                    lambda: replicate.run(
                        UPSCALE_MODEL,
                        input=input_params
                    )
                )
                
                logger.info(f"Replicate output: {output}")
                
                # Download the result
                output_url = output
                if isinstance(output, list) and len(output) > 0:
                    output_url = output[0]
                elif isinstance(output, dict) and "output" in output:
                    output_url = output["output"]
                
                if not output_url:
                    raise ValueError("No output URL returned from Replicate")
                
                logger.info(f"Downloading result from: {output_url}")
                
                async with httpx.AsyncClient() as client:
                    response = await client.get(output_url)
                    response.raise_for_status()
                    return response.content
                    
            finally:
                # Clean up the temporary file
                try:
                    os.unlink(temp_input_file.name)
                except Exception as e:
                    logger.warning(f"Failed to delete temporary file: {e}")
    
    @staticmethod
    async def _upscale_with_pil(
        input_path: str,
        scale_factor: int,
        output_format: str = "png"
    ) -> bytes:
        """
        Upscales an image using PIL as a fallback.
        
        Args:
            input_path: Path to the input image
            scale_factor: The scale factor (2, 4, 6, 8, 16)
            output_format: Output format (jpeg, png, jpg, webp)
            
        Returns:
            bytes: The processed image data
        """
        try:
            # Check if the file exists
            if not os.path.exists(input_path):
                raise FileNotFoundError(f"Input file not found: {input_path}")
                
            img = Image.open(input_path)
            width, height = img.size
            new_width = width * scale_factor
            new_height = height * scale_factor
            upscaled_img = img.resize((new_width, new_height), Image.LANCZOS)
            
            # Save the upscaled image to a BytesIO object
            output = BytesIO()
            
            # Convert output_format to PIL format
            pil_format = output_format.upper()
            if pil_format == "JPG":
                pil_format = "JPEG"
            
            upscaled_img.save(output, format=pil_format)
            return output.getvalue()
        except Exception as e:
            logger.error(f"Error in PIL upscaling: {str(e)}")
            # Create a simple error image
            error_img = Image.new('RGB', (400, 200), color=(255, 0, 0))
            output = BytesIO()
            error_img.save(output, format='PNG')
            return output.getvalue() 