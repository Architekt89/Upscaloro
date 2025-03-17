import logging
from fastapi import HTTPException, Request, status, Depends
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import uuid
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Import database handler and supabase client
from backend.database import DatabaseHandler, supabase
from backend.auth import get_current_active_user, User

async def get_subscription(user_id: str, current_user: Optional[User] = Depends(get_current_active_user)):
    """
    Get subscription information for a user
    """
    try:
        # Ensure the user is authenticated
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # For now, allow users to only see their own subscription
        # Admin users could bypass this check
        if current_user.username != user_id:
            logger.warning(f"User {current_user.username} attempted to access subscription for {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this subscription"
            )
        
        # Query the subscriptions table
        try:
            # Get the subscription from the database
            subscription = await DatabaseHandler.get_subscription(user_id)
            
            if not subscription:
                logger.info(f"No subscription found for user: {user_id}")
                # If no subscription is found, check the user record for subscription info
                user = await DatabaseHandler.get_user(user_id)
                if user and user.get("subscription_tier") != "free":
                    # User has subscription info in the user record but not in subscriptions table
                    # This is likely due to a migration or data inconsistency
                    logger.info(f"User has subscription info in user record: {user.get('subscription_tier')}")
                    return {
                        "status": "success",
                        "data": {
                            "has_subscription": True,
                            "subscription_tier": user.get("subscription_tier", "free"),
                            "subscription_status": user.get("subscription_status", "active"),
                            "current_period_end": user.get("subscription_current_period_end")
                        }
                    }
                else:
                    # Truly no subscription
                    return {
                        "status": "success",
                        "data": {
                            "has_subscription": False,
                            "subscription_tier": "free",
                            "subscription_status": None,
                            "current_period_end": None
                        }
                    }
            
            # Return the subscription data
            logger.info(f"Subscription found for user: {user_id}, plan: {subscription.get('plan', 'free')}")
            return {
                "status": "success",
                "data": {
                    "has_subscription": True,
                    "subscription_tier": subscription.get("plan", "free"),
                    "subscription_status": subscription.get("status"),
                    "current_period_end": subscription.get("current_period_end")
                }
            }
        except Exception as e:
            logger.error(f"Error fetching subscription: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching subscription: {str(e)}"
            )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error in get_subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

async def test_create_subscription():
    """
    Test endpoint to create a subscription record
    """
    try:
        # Create a test subscription with a valid UUID
        user_id = str(uuid.uuid4())  # Generate a valid UUID
        subscription_data = {
            "stripe_customer_id": "test_customer_id",
            "stripe_subscription_id": "test_subscription_id",
            "plan": "pro",
            "status": "active",
            "current_period_end": (datetime.now() + timedelta(days=30)).isoformat(),
            "email": "test@example.com"
        }
        
        logger.info(f"Attempting to create test subscription with user_id: {user_id}")
        logger.info(f"Subscription data: {subscription_data}")
        
        # Try direct table access first for debugging
        try:
            direct_result = await supabase.table("subscriptions").upsert({
                "id": user_id,
                "stripe_customer_id": subscription_data["stripe_customer_id"],
                "stripe_subscription_id": subscription_data["stripe_subscription_id"],
                "plan": subscription_data["plan"],
                "status": subscription_data["status"],
                "current_period_end": subscription_data["current_period_end"],
                "email": subscription_data["email"]
            }).execute()
            logger.info(f"Direct table access result: {direct_result}")
        except Exception as e:
            logger.error(f"Error with direct table access: {str(e)}")
        
        # Use the upsert_subscription method
        result = await DatabaseHandler.upsert_subscription(
            user_id=user_id,
            stripe_customer_id=subscription_data["stripe_customer_id"],
            stripe_subscription_id=subscription_data["stripe_subscription_id"],
            plan=subscription_data["plan"],
            status=subscription_data["status"],
            current_period_end=datetime.now() + timedelta(days=30),
            email=subscription_data["email"]
        )
        
        if result:
            logger.info(f"Successfully created test subscription: {result}")
            return {
                "status": "success",
                "message": "Test subscription created",
                "data": result
            }
        else:
            logger.error("Failed to create test subscription: result was None")
            return {
                "status": "error",
                "message": "Failed to create test subscription"
            }
    except Exception as e:
        logger.error(f"Error creating test subscription: {str(e)}")
        return {
            "status": "error",
            "message": f"Error creating test subscription: {str(e)}"
        } 