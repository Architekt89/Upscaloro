import os
import json
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
from database import DatabaseHandler

# Load environment variables
load_dotenv()

async def manual_upgrade(user_id: str, plan_id: str = "pro"):
    """
    Manually upgrade a user to a specified plan.
    
    Args:
        user_id: The ID of the user to upgrade
        plan_id: The plan ID to upgrade to (default: "pro")
    """
    print(f"Manually upgrading user {user_id} to plan {plan_id}")
    
    # Check if the user exists
    user = await DatabaseHandler.get_user(user_id)
    if not user:
        print(f"User not found: {user_id}")
        return
    
    print(f"Found user: {user.get('email')}")
    
    # Update user's subscription data
    current_time = datetime.now()
    expiry_time = current_time + timedelta(days=30)  # 30-day subscription
    
    subscription_data = {
        "subscription_tier": plan_id,
        "subscription_status": "active",
        "subscription_current_period_end": expiry_time.isoformat(),
        "updated_at": current_time.isoformat()
    }
    
    # Update the user record
    updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
    if updated_user:
        print(f"Successfully updated user record: {updated_user}")
    else:
        print("Failed to update user record")
        return
    
    # Create or update subscription record
    subscription_result = await DatabaseHandler.upsert_subscription(
        user_id=user_id,
        stripe_customer_id="manual_upgrade",
        stripe_subscription_id="manual_upgrade",
        plan=plan_id,
        status="active",
        current_period_end=expiry_time,
        email=user.get("email")
    )
    
    if subscription_result:
        print(f"Successfully created/updated subscription record: {subscription_result}")
    else:
        print("Failed to create/update subscription record")
        return
    
    print(f"Successfully upgraded user {user_id} to {plan_id} plan")

if __name__ == "__main__":
    # Replace with the actual user ID
    USER_ID = "0cfbbbdd-553d-4652-b4a7-c5053f0c9664"
    PLAN_ID = "pro"
    
    # Run the async function
    asyncio.run(manual_upgrade(USER_ID, PLAN_ID)) 