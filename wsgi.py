"""
WSGI config for Upscaloro.

This module contains the WSGI application used by production WSGI servers
such as Gunicorn.
"""

import os
import sys

# Add the current directory to the path
sys.path.insert(0, os.path.abspath("."))

# Import the FastAPI app
try:
    from backend.main import app as application
except ImportError as e:
    print(f"Error importing from backend.main: {e}")
    
    # If that fails, try a different approach
    try:
        # Try to import the app directly
        import backend.main
        application = backend.main.app
    except ImportError as e2:
        print(f"Error importing backend.main: {e2}")
        
        # As a last resort, try to run the app from the backend directory
        print("Attempting to run the app from the backend directory...")
        os.chdir("backend")
        from main import app as application

# This variable is used by WSGI servers like Gunicorn
app = application 