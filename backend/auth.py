from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import logging
import base64
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

# Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    subscription_tier: str = "free"  # "free" or "pro"
    images_processed_this_month: int = 0

class UserInDB(User):
    hashed_password: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_supabase_jwt(token: str):
    """
    Decode a Supabase JWT token without verification to extract claims.
    This is used for debugging purposes only.
    """
    try:
        # Split the token into parts
        parts = token.split('.')
        if len(parts) != 3:
            logger.error("Invalid JWT format")
            return None
        
        # Decode the payload (middle part)
        payload_b64 = parts[1]
        # Add padding if needed
        payload_b64 += '=' * (4 - len(payload_b64) % 4) if len(payload_b64) % 4 != 0 else ''
        
        try:
            payload_json = base64.b64decode(payload_b64).decode('utf-8')
            payload = json.loads(payload_json)
            return payload
        except Exception as e:
            logger.error(f"Error decoding JWT payload: {str(e)}")
            return None
    except Exception as e:
        logger.error(f"Error processing JWT: {str(e)}")
        return None

def verify_supabase_token(token: str):
    """
    Verify and decode a Supabase JWT token using HS256 signature verification.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        dict: The verified token payload or None if verification fails
    """
    if not SUPABASE_JWT_SECRET:
        logger.error("SUPABASE_JWT_SECRET environment variable not set")
        return None
        
    try:
        # Verify and decode the token using the SUPABASE_JWT_SECRET
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return payload
    except ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except JWTError as e:
        logger.warning(f"Failed to verify Supabase token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error verifying token: {str(e)}")
        return None

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    if token is None:
        # Allow anonymous access for endpoints that don't require authentication
        logger.warning("No token provided in request")
        return None
    
    logger.info(f"Validating token: {token[:10]}...")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # First try to decode with our own secret key
        try:
            logger.info("Attempting to decode token with app secret key")
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                logger.warning("Token missing 'sub' claim")
                raise credentials_exception
            token_data = TokenData(username=username)
            logger.info(f"Successfully decoded token for user: {username}")
            
            # Get user from database using our own token
            logger.info(f"Getting user from database: {token_data.username}")
            user = await get_user_from_db(token_data.username)
            if user is None:
                logger.warning(f"User not found in database: {token_data.username}")
                raise credentials_exception
            return user
            
        except JWTError as e:
            logger.warning(f"Failed to decode with app secret: {str(e)}")
            
            # If that fails, try with Supabase JWT verification
            logger.info("Attempting to verify Supabase token")
            # Verify the token cryptographically using HS256
            verified_payload = verify_supabase_token(token)
            
            if not verified_payload:
                # For debugging purposes, still attempt to decode without verification
                # to get more information about the token
                decoded_payload = decode_supabase_jwt(token)
                if decoded_payload:
                    logger.debug(f"Token payload (unverified, for debugging): {decoded_payload}")
                
                logger.warning("Failed to verify Supabase token signature")
                raise credentials_exception
                
            # If verification succeeded, check if this is a Supabase token
            if 'aud' in verified_payload and verified_payload.get('aud') == 'authenticated':
                logger.info("Verified Supabase token")
                
                # Extract user info from verified payload
                user_id = verified_payload.get("sub")
                email = verified_payload.get("email")
                
                if not user_id:
                    logger.warning("Supabase token missing 'sub' claim")
                    raise credentials_exception
                
                logger.info(f"Successfully verified Supabase token for user: {user_id}")
                
                # Get or create user in our database
                user = await get_or_create_user_from_supabase(user_id, email)
                return user
            else:
                logger.warning("Token does not appear to be a valid Supabase token")
                raise credentials_exception
    except Exception as e:
        logger.error(f"Unexpected error in authentication: {str(e)}")
        raise credentials_exception

async def get_current_active_user(current_user: Optional[User] = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Database functions
async def get_user_from_db(username: str):
    # TODO: Implement Supabase integration
    # This is a placeholder for the actual implementation
    fake_users_db = {
        "johndoe": {
            "username": "johndoe",
            "full_name": "John Doe",
            "email": "johndoe@example.com",
            "hashed_password": get_password_hash("secret"),
            "disabled": False,
            "subscription_tier": "free",
            "images_processed_this_month": 0
        }
    }
    if username in fake_users_db:
        user_dict = fake_users_db[username]
        return UserInDB(**user_dict)
    return None

async def get_or_create_user_from_supabase(user_id: str, email: Optional[str] = None):
    """
    Gets or creates a user in our database based on Supabase authentication.
    
    Args:
        user_id: The Supabase user ID
        email: The user's email address
        
    Returns:
        User: The user object
    """
    try:
        from backend.database import DatabaseHandler
        
        # First, try to get the user from our database
        existing_user = await DatabaseHandler.get_user(user_id)
        
        if existing_user:
            logger.info(f"Found existing user in database: {user_id}")
            # Update last_login time
            await DatabaseHandler.update_user(user_id, {"last_login": datetime.utcnow().isoformat()})
            
            # Return user object
            return User(
                username=user_id,
                email=existing_user.get("email"),
                full_name=existing_user.get("username"),
                disabled=False,
                subscription_tier=existing_user.get("subscription_tier", "free"),
                images_processed_this_month=existing_user.get("images_processed_this_month", 0)
            )
        else:
            logger.info(f"Creating new user in database: {user_id}")
            # Create new user in our database
            user_data = {
                "id": user_id,
                "email": email,
                "username": email.split("@")[0] if email else user_id[:8],
                "subscription_tier": "free",
                "subscription_status": "active",
                "images_processed_this_month": 0,
                "total_images_processed": 0,
                "last_login": datetime.utcnow().isoformat()
            }
            
            created_user = await DatabaseHandler.create_user(user_data)
            
            if not created_user:
                logger.error(f"Failed to create user in database: {user_id}")
                # Return a basic user object even if database creation failed
                return User(
                    username=user_id,
                    email=email,
                    full_name=None,
                    disabled=False,
                    subscription_tier="free",
                    images_processed_this_month=0
                )
            
            logger.info(f"Successfully created user in database: {user_id}")
            return User(
                username=user_id,
                email=email,
                full_name=user_data.get("username"),
                disabled=False,
                subscription_tier="free",
                images_processed_this_month=0
            )
    except Exception as e:
        logger.error(f"Error in get_or_create_user_from_supabase: {str(e)}")
        # Return a basic user object even if there was an error
        return User(
            username=user_id,
            email=email,
            full_name=None,
            disabled=False,
            subscription_tier="free",
            images_processed_this_month=0
        ) 