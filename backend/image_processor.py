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

# Mapping from user-friendly modes to Replicate Clarity Upscaler models
MODE_TO_MODEL = {
    "block_mode": "epicrealism_naturalSinRC1VAE",  # General purpose
    "face_mode": "juggernaut_reborn",              # Face-focused
    "waifu_mode": "flat2DAnimerge_v45Sharp"        # Anime/waifu
}

# Clarity Upscaler model ID
CLARITY_UPSCALER_MODEL = "philz1337x/clarity-upscaler"

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
        Upscales an image using Replicate's Clarity Upscaler API.
        
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
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
                temp_file.write(image_data)
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
                
                # Clean up temporary file
                os.unlink(input_path)
                
                return processed_image_data, None
            except Exception as e:
                logger.error(f"Error processing image: {str(e)}")
                # Clean up temporary file
                os.unlink(input_path)
                
                # Fall back to simple resizing if API fails
                logger.warning(f"Replicate API failed: {str(e)}. Falling back to simple resizing.")
                return await ImageProcessor._upscale_with_pil(input_path, scale_factor, output_format)
                
        except Exception as e:
            logger.error(f"Error upscaling image: {str(e)}")
            return None, f"Error upscaling image: {str(e)}"
    
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
        Upscales an image using Replicate's Clarity Upscaler API.
        """
        if not REPLICATE_API_TOKEN:
            raise ValueError("REPLICATE_API_TOKEN is not set")
        
        # Set the API token for the replicate client
        os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
        
        # Get the appropriate model based on the mode
        model_version = CLARITY_UPSCALER_MODEL
        selected_model = MODE_TO_MODEL.get(mode)
        
        logger.info(f"Using Replicate Clarity Upscaler model: {model_version} with {selected_model}")
        
        # Create a temporary file for the input image
        with tempfile.NamedTemporaryFile(suffix=f".{output_format}", delete=False) as temp_input_file:
            try:
                # Convert base64 to binary
                image_data = base64.b64decode(base64_image)
                temp_input_file.write(image_data)
                temp_input_file.flush()
                
                # Prepare input parameters for Clarity Upscaler
                input_params = {
                    "image": temp_input_file.name,  # Pass the file path instead of file handle
                    "model": selected_model,
                    "scale": scale_factor,
                    "dynamic": dynamic,
                    "handfix": handfix,
                    "creativity": creativity,
                    "resemblance": resemblance,
                    "output_format": output_format
                }
                
                logger.info(f"Replicate input parameters: {input_params}")
                
                # Run the prediction
                loop = asyncio.get_event_loop()
                output = await loop.run_in_executor(
                    None,
                    lambda: replicate.run(
                        model_version,
                        input=input_params
                    )
                )
                
                logger.info(f"Replicate output: {output}")
                
                # Download the result
                if isinstance(output, list):
                    output_url = output[0]
                elif isinstance(output, dict) and "output" in output:
                    output_url = output["output"]
                elif isinstance(output, str):
                    output_url = output
                else:
                    raise ValueError(f"Unexpected output format from Replicate: {output}")
                
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