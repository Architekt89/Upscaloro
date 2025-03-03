"""
WSGI config for Upscaloro.

This module contains the WSGI application used by production WSGI servers
such as Gunicorn.
"""

import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Add the current directory to the path
sys.path.insert(0, os.path.abspath("."))

# Try multiple approaches to import the app
try:
    logger.info("Attempting to import app from backend.main...")
    from backend.main import app as application
except ImportError as e:
    logger.error(f"Error importing from backend.main: {e}")
    
    try:
        logger.info("Attempting to import backend.main module...")
        import backend.main
        application = backend.main.app
    except ImportError as e2:
        logger.error(f"Error importing backend.main module: {e2}")
        
        try:
            logger.info("Attempting to change directory to backend...")
            original_dir = os.getcwd()
            os.chdir("backend")
            sys.path.insert(0, os.path.abspath("."))
            
            try:
                logger.info("Attempting to import app from main...")
                from main import app as application
            except ImportError as e3:
                logger.error(f"Error importing from main: {e3}")
                raise ImportError("Failed to import the FastAPI application") from e3
            finally:
                # Change back to the original directory
                os.chdir(original_dir)
        except Exception as e4:
            logger.error(f"Error changing directory: {e4}")
            raise ImportError("Failed to import the FastAPI application") from e4

# This variable is used by WSGI servers like Gunicorn
app = application
logger.info("Successfully imported FastAPI application") 