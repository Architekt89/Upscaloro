import asyncio
import uuid
import logging
from datetime import datetime, timedelta
from database import DatabaseHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

async def test_upsert_subscription():
    """
    Test the upsert_subscription function in the DatabaseHandler class.
    """
    try:
        # Generate a test user ID
        user_id = str(uuid.uuid4())
        
        # Create test subscription data
        stripe_customer_id = f"cus_test_{uuid.uuid4().hex[:8]}"
        stripe_subscription_id = f"sub_test_{uuid.uuid4().hex[:8]}"
        plan = "pro"
        status = "active"
        current_period_end = datetime.now() + timedelta(days=30)
        email = "test@example.com"
        
        logger.info(f"Testing upsert_subscription with user_id: {user_id}")
        logger.info(f"Test data: customer_id={stripe_customer_id}, subscription_id={stripe_subscription_id}, plan={plan}, status={status}")
        
        # Call the upsert_subscription function
        result = await DatabaseHandler.upsert_subscription(
            user_id=user_id,
            stripe_customer_id=stripe_customer_id,
            stripe_subscription_id=stripe_subscription_id,
            plan=plan,
            status=status,
            current_period_end=current_period_end,
            email=email
        )
        
        if result:
            logger.info(f"Successfully upserted subscription: {result}")
        else:
            logger.error("Failed to upsert subscription")
        
        # Verify the subscription was created by retrieving it
        subscription = await DatabaseHandler.get_subscription(user_id)
        
        if subscription:
            logger.info(f"Successfully retrieved subscription: {subscription}")
        else:
            logger.error("Failed to retrieve subscription")
        
        return result
    except Exception as e:
        logger.error(f"Error in test_upsert_subscription: {str(e)}")
        return None

if __name__ == "__main__":
    # Run the test
    result = asyncio.run(test_upsert_subscription())
    
    if result:
        print("Test completed successfully!")
    else:
        print("Test failed!") 