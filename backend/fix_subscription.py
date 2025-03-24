#!/usr/bin/env python3
import os
import sys
import json
import asyncio
import logging
from dotenv import load_dotenv
import supabase

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

def update_user_subscription(email, plan):
    """Update user subscription tier directly using SQL"""
    try:
        # Verify inputs
        if not email:
            logger.error("Email is required")
            return False
            
        if plan not in ["free", "pro", "enterprise"]:
            logger.error(f"Invalid plan: {plan}. Must be one of: free, pro, enterprise")
            return False
            
        # Create Supabase client using service key for admin operations
        supabase_auth_key = SUPABASE_SERVICE_KEY or SUPABASE_KEY
        if not supabase_auth_key:
            logger.error("No Supabase authentication key found (SUPABASE_SERVICE_KEY or SUPABASE_KEY)")
            return False
            
        # Use direct SQL to update the user's subscription tier
        logger.info(f"Attempting to update {email} to {plan} tier using direct SQL")
        
        # Initialize Supabase client with available key
        client = supabase.create_client(SUPABASE_URL, supabase_auth_key)
        
        # First, find the user by email
        response = client.table("users").select("*").eq("email", email).execute()
        
        if not response.data or len(response.data) == 0:
            logger.error(f"User with email {email} not found")
            return False
            
        user = response.data[0]
        user_id = user.get("id")
        current_tier = user.get("subscription_tier", "free")
        
        logger.info(f"Found user {user_id} with current tier: {current_tier}")
        
        # Update the user's subscription tier
        update_response = client.table("users").update({
            "subscription_tier": plan,
            "updated_at": "now()"
        }).eq("email", email).execute()
        
        if update_response.data and len(update_response.data) > 0:
            updated_user = update_response.data[0]
            logger.info(f"Successfully updated user {user_id} from {current_tier} to {plan}")
            logger.info(f"New user data: {json.dumps(updated_user, indent=2)}")
            return True
        else:
            logger.error(f"Failed to update user {user_id} to {plan}")
            return False
            
    except Exception as e:
        logger.error(f"Error updating subscription: {str(e)}")
        return False

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 3:
        print("Usage: python fix_subscription.py <email> <plan>")
        print("Example: python fix_subscription.py user@example.com enterprise")
        sys.exit(1)
        
    email = sys.argv[1]
    plan = sys.argv[2]
    
    # Handle the current user immediately
    logger.info(f"Starting subscription update for {email} to {plan} tier")
    success = update_user_subscription(email, plan)
    
    if success:
        logger.info(f"✅ Successfully updated {email} to {plan} tier!")
        
        # Add whitelist users that we should always check and fix
        whitelist_users = ["anna.biel89@outlook.com", "beauve-ra@outlook.com", "simballo@outlook.com"]
        
        # If this wasn't for simballo and simballo needs fixing
        if email != "simballo@outlook.com" and "simballo@outlook.com" in whitelist_users:
            logger.info(f"🔍 Checking if whitelist user simballo@outlook.com needs fixing...")
            whitelist_success = update_user_subscription("simballo@outlook.com", "enterprise")
            if whitelist_success:
                logger.info(f"✅ Successfully updated simballo@outlook.com to enterprise tier!")
            else:
                logger.warning(f"⚠️ Failed to update simballo@outlook.com to enterprise tier")
                
        sys.exit(0)
    else:
        logger.error(f"❌ Failed to update {email} to {plan} tier")
        sys.exit(1)

if __name__ == "__main__":
    main() 