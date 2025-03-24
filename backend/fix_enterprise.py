#!/usr/bin/env python3
import os
import sys
import json
import logging
import requests
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get API key
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")
if not ADMIN_API_KEY:
    logger.error("❌ ADMIN_API_KEY not found in environment variables. You must set this to use this script.")
    sys.exit(1)

def fix_subscription(email, target_plan="enterprise"):
    """
    Fix a user's subscription by using the manual-upgrade API endpoint
    """
    if not email:
        logger.error("❌ Email is required")
        return False
        
    if target_plan not in ["free", "pro", "enterprise"]:
        logger.error(f"❌ Invalid plan: {target_plan}. Must be one of: free, pro, enterprise")
        return False
        
    logger.info(f"🔧 Fixing subscription for {email} to {target_plan} plan...")
    
    try:
        # Use the manual upgrade API endpoint
        api_url = "https://upscaloro.onrender.com/api/manual-upgrade"
        
        payload = {
            "email": email,
            "plan": target_plan,
            "admin_key": ADMIN_API_KEY
        }
        
        response = requests.post(api_url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"✅ Success: {result.get('message')}")
            return True
        else:
            try:
                error_data = response.json()
                logger.error(f"❌ API error: {error_data.get('error')}")
            except:
                logger.error(f"❌ API error: Status code {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error fixing subscription: {str(e)}")
        return False

def verify_subscription(email):
    """
    Verify a user's current subscription status
    """
    if not email:
        logger.error("❌ Email is required")
        return None
        
    try:
        # Use the subscription check API endpoint
        api_url = f"https://upscaloro.onrender.com/api/subscription/check?email={email}"
        
        response = requests.get(api_url)
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Current subscription for {email}:")
            logger.info(f"  Tier: {result.get('subscription_tier', 'unknown')}")
            logger.info(f"  Status: {result.get('subscription_status', 'unknown')}")
            logger.info(f"  End date: {result.get('subscription_end_date', 'unknown')}")
            return result
        else:
            try:
                error_data = response.json()
                logger.error(f"❌ API error: {error_data.get('error')}")
            except:
                logger.error(f"❌ API error: Status code {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Error verifying subscription: {str(e)}")
        return None

def main():
    """
    Main function to handle command line arguments
    """
    if len(sys.argv) < 2:
        print("Usage: python fix_enterprise.py <email> [plan]")
        print("Example: python fix_enterprise.py user@example.com enterprise")
        print("\nOptions:")
        print("  verify <email>   - Check the current subscription status for an email")
        print("  fix <email> [plan] - Fix a subscription for an email (defaults to enterprise)")
        sys.exit(1)
        
    command = sys.argv[1]
    
    if command == "verify" and len(sys.argv) >= 3:
        email = sys.argv[2]
        result = verify_subscription(email)
        sys.exit(0 if result else 1)
    elif command == "fix" and len(sys.argv) >= 3:
        email = sys.argv[2]
        plan = sys.argv[3] if len(sys.argv) >= 4 else "enterprise"
        
        # First verify current status
        current = verify_subscription(email)
        if current and current.get("subscription_tier") == plan:
            logger.info(f"✅ User {email} is already on {plan} plan. No changes needed.")
            sys.exit(0)
            
        # Then fix the subscription
        success = fix_subscription(email, plan)
        
        if success:
            logger.info(f"✅ Successfully fixed {email} to {plan} tier!")
            
            # Verify the change was applied
            logger.info("Verifying subscription change was applied...")
            verify_subscription(email)
                
            sys.exit(0)
        else:
            logger.error(f"❌ Failed to update {email} to {plan} tier")
            sys.exit(1)
    else:
        email = sys.argv[1]
        plan = sys.argv[2] if len(sys.argv) >= 3 else "enterprise"
        
        # Handle the case where they call script with just email [plan]
        
        # First verify current status
        current = verify_subscription(email)
        if current and current.get("subscription_tier") == plan:
            logger.info(f"✅ User {email} is already on {plan} plan. No changes needed.")
            sys.exit(0)
            
        # Then fix the subscription
        success = fix_subscription(email, plan)
        
        if success:
            logger.info(f"✅ Successfully fixed {email} to {plan} tier!")
            
            # Verify the change was applied
            logger.info("Verifying subscription change was applied...")
            verify_subscription(email)
                
            sys.exit(0)
        else:
            logger.error(f"❌ Failed to update {email} to {plan} tier")
            sys.exit(1)

if __name__ == "__main__":
    main() 