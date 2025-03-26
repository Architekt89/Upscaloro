#!/usr/bin/env python
"""
Enterprise Subscription Fix Script

This script provides utilities to fix Enterprise tier subscriptions when the automatic
webhook handling has failed. Use it when a user has paid for Enterprise but their account
is not properly reflecting the upgraded status.

Usage:
    python fix_enterprise_subscription.py --email user@example.com --tier enterprise
"""

import os
import sys
import uuid
import logging
import argparse
from datetime import datetime, timedelta, timezone
import json
import asyncio
from typing import Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Import environment variables
from dotenv import load_dotenv
load_dotenv()

# Import Supabase client
try:
    from supabase import create_client, Client
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role key for admin operations
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("ERROR: Missing Supabase credentials. Check your .env file.")
        sys.exit(1)
        
    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except ImportError:
    logger.error("ERROR: Supabase Python client not installed. Run: pip install supabase")
    sys.exit(1)

async def fix_user_subscription(email: str, tier: str = "enterprise") -> Dict[str, Any]:
    """
    Fix a user's subscription by directly updating all relevant database tables.
    
    Args:
        email: The user's email address
        tier: The subscription tier to set (default: enterprise)
        
    Returns:
        Dict containing the results of the operation
    """
    logger.info(f"Fixing subscription for {email} to {tier} tier")
    
    try:
        # Step 1: Find the user by email
        user_response = supabase.table("users").select("*").eq("email", email).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            logger.error(f"User not found with email: {email}")
            return {
                "status": "error",
                "message": f"No user found with email {email}"
            }
        
        user = user_response.data[0]
        user_id = user["id"]
        current_tier = user.get("subscription_tier", "free")
        
        logger.info(f"Found user {user_id} with current tier: {current_tier}")
        
        # Step 2: Update subscription data in users table
        current_period_end = datetime.now(timezone.utc) + timedelta(days=365)  # Default to 1 year from now
        
        user_update_data = {
            "subscription_tier": tier,
            "subscription_status": "active",
            "subscription_current_period_end": current_period_end.isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        user_update = supabase.table("users").update(user_update_data).eq("id", user_id).execute()
        
        if user_update.data and len(user_update.data) > 0:
            logger.info(f"✅ Successfully updated user record in users table")
            user_updated = True
        else:
            logger.error(f"❌ Failed to update user record in users table")
            user_updated = False
        
        # Step 3: Update or create subscription record
        # First check if a subscription already exists for this user
        sub_check = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
        
        subscription_data = {
            "user_id": user_id,
            "plan": tier,
            "status": "active",
            "current_period_end": current_period_end.isoformat(),
            "stripe_customer_id": user.get("stripe_customer_id", "manual_fix"),
            "stripe_subscription_id": user.get("stripe_subscription_id", "manual_fix"),
            "email": email,
            "billing_cycle": "monthly",  # Default to monthly
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if sub_check.data and len(sub_check.data) > 0:
            # Update existing subscription
            subscription_id = sub_check.data[0]["id"]
            sub_update = supabase.table("subscriptions").update(subscription_data).eq("id", subscription_id).execute()
            logger.info(f"Updated existing subscription record with ID: {subscription_id}")
            sub_updated = True
        else:
            # Create new subscription with an explicit UUID
            subscription_data["id"] = str(uuid.uuid4())
            sub_insert = supabase.table("subscriptions").insert(subscription_data).execute()
            logger.info(f"Created new subscription record with ID: {subscription_data['id']}")
            sub_updated = True
        
        # Step 4: Update user auth metadata
        try:
            auth_response = supabase.auth.admin.update_user_by_id(
                user_id,
                user_metadata={
                    "subscription_tier": tier,
                    "subscription_status": "active",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            )
            logger.info(f"✅ Updated user auth metadata")
            metadata_updated = True
        except Exception as e:
            logger.error(f"❌ Failed to update auth metadata: {str(e)}")
            # Try alternative method
            try:
                auth_response = supabase.auth.admin.update_user(
                    user_id, 
                    {"data": {"subscription_tier": tier, "subscription_status": "active"}}
                )
                logger.info(f"✅ Updated user auth metadata with alternative method")
                metadata_updated = True
            except Exception as e2:
                logger.error(f"❌ Alternative auth update also failed: {str(e2)}")
                metadata_updated = False
        
        # Step 5: Verify the changes
        verify_response = supabase.table("users").select("subscription_tier").eq("id", user_id).execute()
        
        if verify_response.data and len(verify_response.data) > 0:
            current_tier = verify_response.data[0].get("subscription_tier")
            if current_tier == tier:
                logger.info(f"✅ Verification successful: user tier is now {tier}")
                verified = True
            else:
                logger.error(f"❌ Verification failed: user tier is still {current_tier}")
                verified = False
        else:
            logger.error("❌ Verification failed: could not retrieve user")
            verified = False
        
        # Return detailed results
        return {
            "status": "success" if (user_updated and sub_updated and metadata_updated) else "partial",
            "message": f"User {email} subscription updated to {tier}",
            "user_updated": user_updated,
            "subscription_updated": sub_updated,
            "metadata_updated": metadata_updated,
            "verified": verified,
            "user_id": user_id
        }
    except Exception as e:
        logger.error(f"Error fixing subscription: {str(e)}")
        return {
            "status": "error",
            "message": f"Error fixing subscription: {str(e)}"
        }

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="Fix user subscription tier")
    parser.add_argument("--email", required=True, help="User's email address")
    parser.add_argument("--tier", default="enterprise", choices=["free", "pro", "enterprise"], 
                        help="Subscription tier to set (default: enterprise)")
    return parser.parse_args()

async def main():
    """Main function"""
    args = parse_args()
    result = await fix_user_subscription(args.email, args.tier)
    
    if result["status"] == "success":
        logger.info(f"✅ Successfully updated {args.email} to {args.tier} tier")
        print(json.dumps(result, indent=2))
        return 0
    else:
        logger.error(f"❌ Failed to update {args.email} to {args.tier} tier")
        print(json.dumps(result, indent=2))
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main())) 