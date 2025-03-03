import os
import logging
import json
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your-supabase-url")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-supabase-key")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
class DatabaseHandler:
    """
    Handles Supabase database and storage operations.
    """
    
    @staticmethod
    async def get_user(user_id: str) -> Optional[Dict[str, Any]]:
        """
        Gets a user from the database.
        
        Args:
            user_id: The user ID
            
        Returns:
            Optional[Dict[str, Any]]: The user data
        """
        try:
            response = supabase.table("users").select("*").eq("id", user_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                return None
        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            return None
    
    @staticmethod
    async def create_user(user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Creates a new user in the database.
        
        Args:
            user_data: The user data
            
        Returns:
            Optional[Dict[str, Any]]: The created user data
        """
        try:
            response = supabase.table("users").insert(user_data).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                return None
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return None
    
    @staticmethod
    async def update_user(user_id: str, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Updates a user in the database.
        
        Args:
            user_id: The user ID
            user_data: The user data to update
            
        Returns:
            Optional[Dict[str, Any]]: The updated user data
        """
        try:
            response = supabase.table("users").update(user_data).eq("id", user_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                return None
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return None
    
    @staticmethod
    async def increment_processed_images(user_id: str) -> bool:
        """
        Increments the number of processed images for a user.
        
        Args:
            user_id: The user ID
            
        Returns:
            bool: Whether the operation was successful
        """
        try:
            # Get the current user data
            user = await DatabaseHandler.get_user(user_id)
            
            if not user:
                return False
            
            # Increment the processed images count
            current_count = user.get("images_processed_this_month", 0)
            new_count = current_count + 1
            
            # Update the user data
            updated_user = await DatabaseHandler.update_user(
                user_id,
                {"images_processed_this_month": new_count}
            )
            
            return updated_user is not None
        except Exception as e:
            logger.error(f"Error incrementing processed images: {str(e)}")
            return False
    
    @staticmethod
    async def reset_monthly_counters() -> bool:
        """
        Resets the monthly image processing counters for all users.
        
        Returns:
            bool: Whether the operation was successful
        """
        try:
            response = supabase.table("users").update(
                {"images_processed_this_month": 0}
            ).execute()
            
            return True
        except Exception as e:
            logger.error(f"Error resetting monthly counters: {str(e)}")
            return False
    
    @staticmethod
    async def store_image(
        user_id: str,
        image_data: bytes,
        file_name: str
    ) -> Optional[str]:
        """
        Stores an image in Supabase Storage.
        
        Args:
            user_id: The user ID
            image_data: The image data in bytes
            file_name: The file name
            
        Returns:
            Optional[str]: The image URL
        """
        try:
            # Generate a unique file name
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            unique_file_name = f"{user_id}_{timestamp}_{file_name}"
            
            # Upload the image to Supabase Storage
            response = supabase.storage.from_("images").upload(
                unique_file_name,
                image_data
            )
            
            # Get the public URL
            image_url = supabase.storage.from_("images").get_public_url(unique_file_name)
            
            # Schedule deletion after 24 hours for pro users
            # This would typically be handled by a cron job or similar
            
            return image_url
        except Exception as e:
            logger.error(f"Error storing image: {str(e)}")
            return None
    
    @staticmethod
    async def delete_old_images() -> bool:
        """
        Deletes images older than 24 hours.
        
        Returns:
            bool: Whether the operation was successful
        """
        try:
            # Get all files in the images bucket
            response = supabase.storage.from_("images").list()
            
            if not response:
                return True
            
            # Get the current time
            current_time = datetime.now()
            
            # Filter files older than 24 hours
            for file in response:
                # Extract the timestamp from the file name
                # Format: user_id_YYYYMMDDHHMMSS_file_name
                file_name = file.get("name", "")
                parts = file_name.split("_")
                
                if len(parts) >= 3:
                    try:
                        timestamp_str = parts[1]
                        file_timestamp = datetime.strptime(timestamp_str, "%Y%m%d%H%M%S")
                        
                        # Check if the file is older than 24 hours
                        if current_time - file_timestamp > timedelta(hours=24):
                            # Delete the file
                            supabase.storage.from_("images").remove([file_name])
                    except Exception as e:
                        logger.error(f"Error parsing file timestamp: {str(e)}")
            
            return True
        except Exception as e:
            logger.error(f"Error deleting old images: {str(e)}")
            return False 