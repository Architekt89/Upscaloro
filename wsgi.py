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

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try to import the app from backend.main
try:
    logger.info("Attempting to import app from backend.main...")
    from backend.main import app
    logger.info("Successfully imported app from backend.main")
except ImportError as e:
    logger.warning(f"Failed to import from backend.main: {e}")
    # If that fails, try to import directly from main
    try:
        logger.info("Attempting to import app from main...")
        from main import app
        logger.info("Successfully imported app from main")
    except ImportError as e:
        logger.error(f"Failed to import from main: {e}")
        
        # Try one more approach - change directory to backend and import
        try:
            logger.info("Attempting to change directory to backend and import...")
            original_dir = os.getcwd()
            backend_dir = os.path.join(original_dir, 'backend')
            
            if os.path.exists(backend_dir):
                os.chdir(backend_dir)
                sys.path.insert(0, os.path.abspath("."))
                
                try:
                    from main import app
                    logger.info("Successfully imported app from backend/main")
                except ImportError as e2:
                    logger.error(f"Failed to import from backend/main: {e2}")
                    raise ImportError("Could not import the app from any location") from e2
                finally:
                    # Change back to the original directory
                    os.chdir(original_dir)
            else:
                logger.error(f"Backend directory does not exist: {backend_dir}")
                raise ImportError("Could not import the app from any location") from e
        except Exception as e3:
            logger.error(f"Error during import attempts: {e3}")
            raise ImportError("Could not import the app from any location") from e3

# This is used by gunicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run("wsgi:app", host="0.0.0.0", port=port, log_level="info") 