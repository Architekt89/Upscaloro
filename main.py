import os
import sys

# Add the current directory to the path
sys.path.insert(0, os.path.abspath("."))

try:
    # First try importing directly from backend.main
    from backend.main import app
except ImportError as e:
    print(f"Error importing from backend.main: {e}")
    
    # If that fails, try a different approach
    try:
        # Try to import the app directly
        import backend.main
        app = backend.main.app
    except ImportError as e2:
        print(f"Error importing backend.main: {e2}")
        
        # As a last resort, try to run the app from the backend directory
        print("Attempting to run the app from the backend directory...")
        os.chdir("backend")
        from main import app

# This file is used for deployment
# It imports the FastAPI app from the backend directory

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 