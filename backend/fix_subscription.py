#!/usr/bin/env python3
import os
import sys
import uuid
import json
import asyncio
import logging
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY") 
if not supabase_url or not supabase_key:
    logger.error("Supabase environment variables not set")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

async def fix_billing_cycle(email, target_billing_cycle="yearly"):
    """
    Fix the billing cycle for a user's subscription.
    
    Args:
        email (str): The user's email address
        target_billing_cycle (str): The desired billing cycle (yearly or monthly)
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        logger.info(f"Looking up user with email: {email}")
        
        # Find the user by email
        user_response = supabase.table("users").select("*").eq("email", email).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            logger.error(f"User with email {email} not found")
            return False
            
        user = user_response.data[0]
        logger.info(f"User data from database: {json.dumps(user, indent=2)}")
        
        user_id = user["id"]
        current_tier = user.get("subscription_tier", "free")
        logger.info(f"Found user {user_id} with tier {current_tier}")
        
        # Calculate a renewal date 1 year from now for yearly billing
        if target_billing_cycle == "yearly":
            renewal_date = (datetime.now() + timedelta(days=365)).isoformat()
        else:
            renewal_date = (datetime.now() + timedelta(days=30)).isoformat()
            
        # Check if subscription record exists
        subscription_response = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
        
        if subscription_response.data and len(subscription_response.data) > 0:
            # Update existing subscription
            subscription = subscription_response.data[0]
            subscription_id = subscription["id"]
            
            logger.info(f"Found subscription record: {json.dumps(subscription, indent=2)}")
            
            # Update the subscription billing cycle
            subscription_update = {
                "billing_cycle": target_billing_cycle,
                "current_period_end": renewal_date,
                "updated_at": datetime.now().isoformat()
            }
            
            subscription_result = supabase.table("subscriptions").update(subscription_update).eq("id", subscription_id).execute()
            
            if subscription_result.data and len(subscription_result.data) > 0:
                logger.info(f"Updated subscription record to billing cycle: {target_billing_cycle}")
                
                # Also update the user's subscription_current_period_end to match
                user_update = {
                    "subscription_current_period_end": renewal_date,
                    "updated_at": datetime.now().isoformat()
                }
                
                user_result = supabase.table("users").update(user_update).eq("id", user_id).execute()
                
                if user_result.data and len(user_result.data) > 0:
                    logger.info(f"Updated user's subscription end date to: {renewal_date}")
                else:
                    logger.warning("Failed to update user's subscription end date")
                
                return True
            else:
                logger.error("Failed to update subscription record")
                return False
        else:
            # Create a new subscription record
            logger.info(f"No subscription record found for user {user_id}, creating new record")
            
            # Generate a UUID for the subscription record
            subscription_id = str(uuid.uuid4())
            logger.info(f"Generated subscription ID: {subscription_id}")
            
            subscription_data = {
                "id": subscription_id,  # Add explicit ID
                "user_id": user_id,
                "email": email,
                "plan": current_tier,
                "status": "active",
                "billing_cycle": target_billing_cycle,
                "current_period_end": renewal_date,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            subscription_result = supabase.table("subscriptions").insert(subscription_data).execute()
            
            if subscription_result.data and len(subscription_result.data) > 0:
                logger.info(f"Created new subscription record with billing cycle: {target_billing_cycle}")
                
                # Also update the user's subscription_current_period_end to match
                user_update = {
                    "subscription_current_period_end": renewal_date,
                    "updated_at": datetime.now().isoformat()
                }
                
                user_result = supabase.table("users").update(user_update).eq("id", user_id).execute()
                
                if user_result.data and len(user_result.data) > 0:
                    logger.info(f"Updated user's subscription end date to: {renewal_date}")
                else:
                    logger.warning("Failed to update user's subscription end date")
                
                return True
            else:
                logger.error("Failed to create subscription record")
                return False
                
    except Exception as e:
        logger.error(f"Error fixing billing cycle: {str(e)}")
        return False

if __name__ == "__main__":
    # Check command line arguments
    if len(sys.argv) < 2:
        print("Usage: python fix_subscription.py <email> [yearly|monthly]")
        sys.exit(1)
        
    email = sys.argv[1]
    billing_cycle = sys.argv[2] if len(sys.argv) > 2 else "yearly"
    
    if billing_cycle not in ["yearly", "monthly"]:
        print("Billing cycle must be either 'yearly' or 'monthly'")
        sys.exit(1)
        
    # Run the fix function
    success = asyncio.run(fix_billing_cycle(email, billing_cycle))
    
    if success:
        print(f"Successfully updated billing cycle for {email} to {billing_cycle}")
        sys.exit(0)
    else:
        print(f"Failed to update billing cycle for {email}")
        sys.exit(1) 