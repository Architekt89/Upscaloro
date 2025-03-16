import logging
from fastapi import HTTPException, Request
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Import database handler and supabase client
from backend.database import DatabaseHandler, supabase

async def get_subscription(user_id: str, request: Request):
    """
    Get subscription information for a user
    """
    try:
        # Verify the user is authenticated
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Not authenticated"
            )
        
        # Extract the token
        token = auth_header.split(" ")[1]
        
        # Verify the token (this is a simplified approach)
        # In a real app, you would verify the token with your auth provider
        # and ensure the requesting user has permission to access this user's data
        try:
            # For now, we'll just check if the user exists
            user = await DatabaseHandler.get_user(user_id)
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail="User not found"
                )
        except Exception as e:
            logger.error(f"Error verifying user: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )
        
        # Query the subscriptions table
        try:
            # Get the subscription from the database
            subscription = await DatabaseHandler.get_subscription(user_id)
            
            if not subscription:
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
            logger.error(f"Error retrieving subscription: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error retrieving subscription: {str(e)}"
            )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error in get_subscription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

async def test_create_subscription():
    """
    Test endpoint to create a subscription record
    """
    try:
        # Create a test subscription
        user_id = "test_user_id"
        subscription_data = {
            "stripe_customer_id": "test_customer_id",
            "stripe_subscription_id": "test_subscription_id",
            "plan": "pro",
            "status": "active",
            "current_period_end": (datetime.now() + timedelta(days=30)).isoformat(),
            "email": "test@example.com"
        }
        
        logger.info(f"Attempting to create test subscription with data: {subscription_data}")
        
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