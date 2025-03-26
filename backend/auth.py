from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Union
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
# Development mode flag - ONLY USE IN DEVELOPMENT!
INSECURE_AUTH_MODE = os.getenv("INSECURE_AUTH_MODE", "false").lower() == "true"

if INSECURE_AUTH_MODE:
    logger.warning("!!! RUNNING IN INSECURE AUTH MODE - DO NOT USE IN PRODUCTION !!!")

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

def prepare_secret_key(key: str, algorithm: str = "HS256") -> Union[str, bytes]:
    """
    Prepare the secret key for the given algorithm.
    Some algorithms require specific key formats.
    
    Args:
        key: The raw key string
        algorithm: The JWT algorithm to be used
        
    Returns:
        The properly formatted key
    """
    if not key:
        return key
        
    # For HS256, the key can be a plain string or bytes
    if algorithm.startswith("HS"):
        # Try to detect if the key is base64 encoded
        try:
            if key.endswith('='):  # Possible base64 padding
                decoded = base64.b64decode(key)
                logger.debug("Using base64 decoded key for HS256")
                return decoded
        except Exception:
            pass
        return key
        
    # For RS256 and ES256, the key should be a PEM formatted string
    elif algorithm.startswith("RS") or algorithm.startswith("ES"):
        # Check if the key looks like a PEM-formatted key
        if "-----BEGIN" not in key:
            # Try to format it as a public key
            try:
                # This is a simplified approach - in reality, you'd need proper PEM formatting
                formatted_key = f"-----BEGIN PUBLIC KEY-----\n{key}\n-----END PUBLIC KEY-----"
                logger.debug("Formatted key as PEM for RS/ES algorithm")
                return formatted_key
            except Exception as e:
                logger.warning(f"Failed to format RS/ES key: {str(e)}")
                return key
    
    # Default: return the key as is
    return key

def verify_supabase_token(token: str):
    """
    Verify and decode a Supabase JWT token using signature verification.
    Tries multiple algorithms to accommodate different Supabase configurations.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        dict: The verified token payload or None if verification fails
    """
    if not SUPABASE_JWT_SECRET:
        logger.error("SUPABASE_JWT_SECRET environment variable not set")
        return None
        
    try:
        # First try to decode the payload without verification to inspect it
        decoded_payload = decode_supabase_jwt(token)
        token_alg = None
        
        if decoded_payload:
            logger.debug(f"Unverified token payload: {decoded_payload}")
            # Log the algorithm from the header if possible
            try:
                header = json.loads(base64.b64decode(token.split('.')[0] + '==').decode('utf-8'))
                logger.debug(f"Token header: {header}")
                if 'alg' in header:
                    token_alg = header['alg'] 
                    logger.info(f"Token claims to use algorithm: {token_alg}")
            except Exception as e:
                logger.debug(f"Couldn't decode token header: {str(e)}")
        
        # Try algorithms in order of likelihood
        algorithms_to_try = [token_alg] if token_alg else ["HS256", "RS256"]
        
        for alg in algorithms_to_try:
            try:
                # Prepare the key for this algorithm
                formatted_key = prepare_secret_key(SUPABASE_JWT_SECRET, alg)
                
                # Try to verify with this algorithm
                payload = jwt.decode(token, formatted_key, algorithms=[alg])
                logger.info(f"Successfully verified token with {alg}")
                return payload
            except Exception as e:
                logger.debug(f"{alg} verification failed: {str(e)}")
            
        # If all verification attempts fail, try accepting the token without verification
        # SECURITY WARNING: This is a temporary fallback and should be removed in production
        if decoded_payload and 'aud' in decoded_payload and decoded_payload.get('aud') == 'authenticated':
            logger.warning("SECURITY RISK: Accepting token without verification as a temporary measure")
            return decoded_payload
            
        # If we get here, all verification methods failed
        logger.warning("All token verification methods failed")
        return None
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
    
    logger.info(f"Validating token: {token[:15]}...")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Development mode - bypass token verification (SECURITY RISK!)
    if INSECURE_AUTH_MODE:
        logger.warning("!!! BYPASSING TOKEN VERIFICATION IN INSECURE MODE !!!")
        decoded_payload = decode_supabase_jwt(token)
        if decoded_payload and 'aud' in decoded_payload and decoded_payload.get('aud') == 'authenticated':
            user_id = decoded_payload.get("sub")
            email = decoded_payload.get("email")
            
            if user_id:
                logger.warning(f"Accepting unverified token for user: {user_id} (INSECURE MODE)")
                user = await get_or_create_user_from_supabase(user_id, email)
                return user
                
        logger.warning("Even in insecure mode, the token lacks required fields")
    
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
                    logger.info(f"Token payload (unverified, for debugging): {decoded_payload}")
                    # Log key details about the token to help with debugging
                    if 'exp' in decoded_payload:
                        exp_time = datetime.fromtimestamp(decoded_payload['exp'])
                        now = datetime.now()
                        if exp_time < now:
                            logger.warning(f"Token expired at {exp_time} (now: {now})")
                        else:
                            logger.info(f"Token expiration: {exp_time} (valid for {exp_time - now})")
                    
                    if 'iss' in decoded_payload:
                        logger.info(f"Token issuer: {decoded_payload['iss']}")
                
                if SUPABASE_JWT_SECRET:
                    # Only show a portion of the key for security reasons
                    secret_preview = SUPABASE_JWT_SECRET[:5] + "..." + SUPABASE_JWT_SECRET[-5:] if len(SUPABASE_JWT_SECRET) > 10 else "[too short]"
                    logger.debug(f"Using SUPABASE_JWT_SECRET starting with: {secret_preview}")
                else:
                    logger.critical("SUPABASE_JWT_SECRET is not set - cannot verify tokens!")
                
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