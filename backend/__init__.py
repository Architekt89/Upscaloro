# This file makes the backend directory a Python package
# It also helps with imports when deploying to production

# Version information
__version__ = "3.0.0"

# Make key modules available at the package level
try:
    # Use relative imports to avoid issues in different environments
    from .image_processor import ImageProcessor, VALID_MODES, VALID_SCALE_FACTORS, VALID_OUTPUT_FORMATS, MODE_TO_MODEL
    from .auth import get_current_active_user, User
    from .database import DatabaseHandler
except ImportError as e:
    # Log the import error but don't crash, as this might be imported during setup
    import logging
    logging.warning(f"Error importing backend modules: {e}")
    
    # Try absolute imports as a fallback
    try:
        import logging
        logging.warning("Attempting absolute imports as fallback...")
        from backend.image_processor import ImageProcessor, VALID_MODES, VALID_SCALE_FACTORS, VALID_OUTPUT_FORMATS, MODE_TO_MODEL
        from backend.auth import get_current_active_user, User
        from backend.database import DatabaseHandler
    except ImportError as e2:
        logging.warning(f"Error with absolute imports: {e2}")
        # Don't raise an exception here to allow partial imports 