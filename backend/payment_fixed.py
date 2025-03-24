import os
import logging
import stripe
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Stripe configuration
stripe_api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe_api_key:
    logger.warning("STRIPE_SECRET_KEY environment variable is not set!")
else:
    logger.info(f"Stripe API configured with key ending in: {stripe_api_key[-4:] if stripe_api_key else 'None'}")
    stripe.api_key = stripe_api_key

# Subscription plan IDs - These should be created in Stripe dashboard
SUBSCRIPTION_PLANS = {}

# Get plan IDs from environment variables
basic_plan_id = os.getenv("STRIPE_BASIC_PLAN_ID")
pro_plan_id = os.getenv("STRIPE_PRO_PLAN_ID")
enterprise_plan_id = os.getenv("STRIPE_ENTERPRISE_PLAN_ID")

# Add plans to the dictionary if they exist
if basic_plan_id:
    SUBSCRIPTION_PLANS["basic"] = basic_plan_id
if pro_plan_id:
    SUBSCRIPTION_PLANS["pro"] = pro_plan_id
if enterprise_plan_id:
    SUBSCRIPTION_PLANS["enterprise"] = enterprise_plan_id

# Explicitly add the price IDs from frontend/components/PricingSection.tsx for consistency
# This ensures that the same price IDs used in the frontend are recognized in the backend
if not SUBSCRIPTION_PLANS.get("pro"):
    SUBSCRIPTION_PLANS["pro"] = "price_1R1UVUBQ1z6vW0DwWfGtyIW0"  # Monthly Pro plan price ID
if not SUBSCRIPTION_PLANS.get("enterprise"):
    SUBSCRIPTION_PLANS["enterprise"] = "price_1R1UWzBQ1z6vW0DwRDLKndlG"  # Monthly Enterprise plan price ID

# Add annual price IDs too
ANNUAL_PRICE_IDS = {
    "pro_annual": "price_1R1UW3BQ1z6vW0DwI11S9tAu",      # Annual Pro plan price ID
    "enterprise_annual": "price_1R1UXlBQ1z6vW0DwMaBDmKaZ"  # Annual Enterprise plan price ID
}

# Create a list of all annual price IDs for easy lookup
ANNUAL_PRICE_ID_LIST = list(ANNUAL_PRICE_IDS.values())

# Add reversed mapping from price ID to plan for lookup
PRICE_TO_PLAN_MAPPING = {}
for plan, price_id in SUBSCRIPTION_PLANS.items():
    PRICE_TO_PLAN_MAPPING[price_id] = plan

# Add annual price IDs to the mapping as well
for plan_key, price_id in ANNUAL_PRICE_IDS.items():
    base_plan = plan_key.split('_')[0]  # Extract 'pro' or 'enterprise' from 'pro_annual'
    PRICE_TO_PLAN_MAPPING[price_id] = base_plan

# Log the price to plan mapping for debugging
logger.info(f"Price to plan mapping: {PRICE_TO_PLAN_MAPPING}")

# List of known enterprise users who should always be upgraded to enterprise
ENTERPRISE_USERS = [
    "anna.biel89@outlook.com",
    "simballo@outlook.com",
]

# Known Enterprise price IDs (hardcoded for reliability)
ENTERPRISE_PRICE_IDS = [
    "price_1R1UWzBQ1z6vW0DwRDLKndlG",  # Monthly Enterprise
    "price_1R1UXlBQ1z6vW0DwMaBDmKaZ",  # Annual Enterprise
]

# API usage pricing
API_USAGE_PRICE_ID = os.getenv("STRIPE_API_USAGE_PRICE_ID", "price_0987654321")
API_PRICE_PER_IMAGE = 0.003  # $0.003 per image processed via API

class PaymentHandler:
    """
    Handles Stripe payments and subscriptions.
    """
    
    def __init__(self):
        # Initialize Stripe API key
        stripe.api_key = stripe_api_key
        
    @staticmethod
    def is_annual_plan(price_id: str) -> bool:
        """
        Determine if a price ID corresponds to an annual plan.
        
        Args:
            price_id: The Stripe price ID
            
        Returns:
            bool: True if the price ID is for an annual plan, False otherwise
        """
        return price_id in ANNUAL_PRICE_ID_LIST
        
    @staticmethod
    async def create_checkout_session(
        user_id: str,
        plan_id: str,
        success_url: str,
        cancel_url: str,
        billing_cycle: str = "monthly"
    ) -> Dict[str, Any]:
        """
        Create a Stripe checkout session for a subscription plan.
        
        Args:
            user_id: The user's ID
            plan_id: The subscription plan ID
            success_url: The URL to redirect to on successful payment
            cancel_url: The URL to redirect to on cancellation
            billing_cycle: The billing cycle (monthly or yearly)
            
        Returns:
            Dict[str, Any]: Result of the operation
        """
        try:
            # Ensure we have a valid plan ID
            if plan_id not in SUBSCRIPTION_PLANS and plan_id.lower() not in ["pro", "enterprise"]:
                logger.error(f"Invalid plan ID: {plan_id}")
                return {
                    "status": "error",
                    "message": f"Invalid plan ID: {plan_id}"
                }
                
            # Normalize the plan ID to lowercase
            plan_id = plan_id.lower()
            logger.info(f"Creating checkout session for user {user_id} and plan {plan_id} with billing cycle {billing_cycle}")
            
            # Set up price ID based on plan and billing cycle
            if billing_cycle == "yearly":
                if plan_id == "enterprise":
                    price_id = ANNUAL_PRICE_IDS["enterprise_annual"]
                    logger.info(f"Enterprise annual plan selected, using price_id: {price_id}")
                elif plan_id == "pro":
                    price_id = ANNUAL_PRICE_IDS["pro_annual"]
                    logger.info(f"Pro annual plan selected, using price_id: {price_id}")
                else:
                    logger.error(f"Unexpected plan ID for annual billing: {plan_id}, defaulting to Pro annual")
                    price_id = ANNUAL_PRICE_IDS["pro_annual"]
            else:
                # Monthly billing
                if plan_id == "enterprise":
                    # Always use the explicit Enterprise price ID
                    price_id = "price_1R1UWzBQ1z6vW0DwRDLKndlG"  # Monthly Enterprise price ID
                    logger.info(f"Enterprise plan selected, using Enterprise price_id: {price_id}")
                elif plan_id == "pro":
                    # Pro tier price ID
                    price_id = "price_1R1UVUBQ1z6vW0DwWfGtyIW0"  # Monthly Pro price ID
                    logger.info(f"Pro plan selected, using Pro price_id: {price_id}")
                else:
                    logger.error(f"Unexpected plan ID: {plan_id}, defaulting to Pro")
                    price_id = "price_1R1UVUBQ1z6vW0DwWfGtyIW0"  # Default to Pro
            
            # Create the checkout session with metadata to track the plan
            checkout_session = stripe.checkout.Session.create(
                success_url=success_url,
                cancel_url=cancel_url,
                mode="subscription",
                line_items=[{
                    "price": price_id,
                    "quantity": 1
                }],
                metadata={
                    "user_id": user_id,
                    "plan_id": plan_id,  # Store the intended plan in metadata
                    "billing_cycle": billing_cycle
                }
            )
            
            logger.info(f"Checkout session created successfully: {checkout_session.id}")
            
            return {
                "status": "success",
                "url": checkout_session.url,
                "session_id": checkout_session.id
            }
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return {
                "status": "error",
                "message": f"Error creating checkout session: {str(e)}"
            }
    
    @staticmethod
    async def handle_webhook(payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Handles Stripe webhook events.
        
        Args:
            payload: The webhook payload
            signature: The webhook signature
            
        Returns:
            Dict[str, Any]: The response
        """
        try:
            # Get the webhook secret from environment variables
            webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
            if not webhook_secret:
                logger.error("Webhook secret not found in environment variables")
                raise ValueError("Webhook secret not configured")
                
            logger.info(f"Constructing Stripe event from webhook payload with signature: {signature[:10]}...")
            logger.info(f"Using webhook secret (first 4 chars): {webhook_secret[:4] if webhook_secret and len(webhook_secret) > 4 else 'None'}")
            
            try:
                # Verify the webhook signature
                event = stripe.Webhook.construct_event(
                    payload, signature, webhook_secret
                )
            except stripe.error.SignatureVerificationError as e:
                logger.error(f"Webhook signature verification failed: {str(e)}")
                return {
                    "status": "error",
                    "message": f"Webhook signature verification failed: {str(e)}"
                }
            
            logger.info(f"Received Stripe webhook event: {event.type}")
            
            # Special check for any enterprise upgrades needed
            try:
                customer_id = None
                if hasattr(event.data.object, 'customer'):
                    customer_id = event.data.object.customer
                
                # Run enterprise upgrade check for all events
                await PaymentHandler.check_and_apply_enterprise_upgrade(
                    event=event,
                    customer_id=customer_id
                )
            except Exception as e:
                logger.error(f"Error in enterprise upgrade check: {str(e)}")
                # Continue processing the webhook even if this check fails
            
            # Log more details about the event
            try:
                logger.info(f"Event object ID: {event.data.object.id}")
                if hasattr(event.data.object, 'metadata') and event.data.object.metadata:
                    logger.info(f"Event metadata: {event.data.object.metadata}")
                if event.type == "checkout.session.completed" and hasattr(event.data.object, 'customer'):
                    logger.info(f"Customer ID: {event.data.object.customer}")
                if event.type == "checkout.session.completed" and hasattr(event.data.object, 'subscription'):
                    logger.info(f"Subscription ID: {event.data.object.subscription}")
            except Exception as e:
                logger.warning(f"Could not log all event details: {str(e)}")
            
            # Handle the event based on its type
            if event.type == "checkout.session.completed":
                session = event.data.object
                logger.info(f"Checkout session completed: {session.id}")
                logger.info(f"Customer: {session.customer}, Subscription: {session.subscription}")
                
                # Extract necessary data from the session
                customer_id = session.customer
                subscription_id = session.subscription
                user_id = session.metadata.get("user_id")
                
                # CRITICAL: Get the plan directly from session metadata - most reliable source
                intended_plan_id = session.metadata.get("plan_id", "").lower()
                logger.info(f"Intended plan from checkout session metadata: {intended_plan_id}")
                
                # Verify if this should be an Enterprise plan (most important check)
                is_enterprise_plan = False
                
                # Method 1: Check metadata directly
                if intended_plan_id == "enterprise":
                    is_enterprise_plan = True
                    logger.info("✅ Enterprise plan confirmed from session metadata")
                
                if not user_id or not subscription_id:
                    logger.error(f"Missing required data in checkout session: user_id={user_id}, subscription_id={subscription_id}")
                    return {
                        "status": "error",
                        "message": "Missing required data in checkout session"
                    }
                
                # Retrieve the subscription details from Stripe for additional verification
                try:
                    subscription = stripe.Subscription.retrieve(subscription_id)
                    current_period_end = subscription.current_period_end
                    status = subscription.status
                    
                    # Method 2: Check the price ID from the subscription
                    if subscription.items and subscription.items.data:
                        price_id = subscription.items.data[0].price.id
                        price_amount = subscription.items.data[0].price.unit_amount
                        
                        # Log the detected price
                        logger.info(f"Price ID from subscription: {price_id}, Amount: {price_amount}")
                        
                        # Check against known Enterprise price IDs
                        if price_id in ENTERPRISE_PRICE_IDS:
                            is_enterprise_plan = True
                            logger.info(f"✅ Enterprise plan confirmed from price ID: {price_id}")
                        
                        # Method 3: Check price amount (Enterprise is $30+)
                        if price_amount >= 3000:  # $30.00 or more in cents
                            is_enterprise_plan = True
                            logger.info(f"✅ Enterprise plan confirmed from price amount: {price_amount}")
                        
                        # Method 4: Check the product name
                        product_name = subscription.items.data[0].price.product
                        try:
                            product = stripe.Product.retrieve(product_name)
                            product_description = product.name
                            logger.info(f"Product name for plan detection: {product_description}")
                            
                            # Logic to determine the plan based on product name/description
                            if "enterprise" in product_description.lower():
                                logger.info("✅ Product name contains 'enterprise', setting plan to enterprise")
                                plan_id = "enterprise"
                                # Force upgrade to enterprise for any user paying for an enterprise plan
                                PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                            elif "pro" in product_description.lower():
                                logger.info("✅ Product name contains 'pro', setting plan to pro")
                                plan_id = "pro"
                                
                                # If it's an annual plan with higher price, check if it might be enterprise
                                if price_amount >= 2000:  # $20+ is likely an annual payment
                                    logger.info(f"Annual plan detected with price {price_amount}")
                                    if price_amount >= 3000:  # $30+ is likely an enterprise plan
                                        logger.info("💰 High value plan detected, forcing upgrade to enterprise")
                                        plan_id = "enterprise"
                                        PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                            else:
                                logger.warning(f"Could not determine plan from product name: {product_description}")
                        except Exception as e:
                            logger.error(f"Error retrieving product: {str(e)}")
                    else:
                        logger.error(f"No price found in subscription: {subscription_id}")
                        price_id = None
                    
                    # Method 5: Check if user is in Enterprise whitelist
                    customer_email = None
                    try:
                        customer = stripe.Customer.retrieve(customer_id)
                        customer_email = customer.email
                        logger.info(f"Customer email: {customer_email}")
                        
                        if customer_email in ENTERPRISE_USERS:
                            is_enterprise_plan = True
                            logger.info(f"✅ Enterprise plan confirmed from whitelist: {customer_email}")
                    except Exception as e:
                        logger.warning(f"Could not retrieve customer email: {str(e)}")
                    
                    # FINAL DETERMINATION: Set the plan ID based on our comprehensive checks
                    # This ensures users who pay for Enterprise always get Enterprise
                    plan_id = "enterprise" if is_enterprise_plan else "pro"
                    logger.info(f"🔒 FINAL PLAN DETERMINATION: {plan_id}")
                    
                    # Update the user record with subscription details
                    subscription_data = {
                        "subscription_tier": plan_id,
                        "stripe_customer_id": customer_id,
                        "stripe_subscription_id": subscription_id,
                        "subscription_status": status,
                        "subscription_price_id": price_id,
                        "subscription_current_period_end": datetime.fromtimestamp(current_period_end).isoformat(),
                        "subscription_billing_cycle": session.metadata.get("billing_cycle", "monthly"),
                        "updated_at": datetime.now().isoformat()
                    }
                    
                    # Force an immediate upgrade for Enterprise plans
                    if plan_id == "enterprise":
                        logger.info(f"🔒 Enterprise plan confirmed - ensuring Enterprise tier is applied")
                        force_result = await PaymentHandler.force_upgrade_to_enterprise(
                            user_id=user_id,
                            customer_id=customer_id,
                            subscription_id=subscription_id,
                            customer_email=customer_email
                        )
                        logger.info(f"Force upgrade result at checkout: {force_result}")
                    
                    logger.info(f"Updating user record with subscription data: {subscription_data}")
                    from backend.database import DatabaseHandler
                    updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                    
                    if updated_user:
                        logger.info(f"Successfully updated user record: {user_id}")
                    else:
                        logger.error(f"Failed to update user record: {user_id}")
                        return {
                            "status": "error",
                            "message": f"Failed to update user record: {user_id}"
                        }
                except Exception as e:
                    logger.error(f"Error processing checkout.session.completed: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Error processing checkout: {str(e)}"
                    }
                
                return {
                    "status": "success",
                    "message": f"Checkout completed for user {user_id} with plan {plan_id}"
                }
                
            elif event.type == "customer.subscription.created":
                subscription = event.data.object
                customer_id = subscription.customer
                logger.info(f"Subscription created for customer: {customer_id}")
                
                # Extract necessary data from the subscription
                subscription_id = subscription.id
                status = subscription.status
                current_period_end = subscription.current_period_end
                
                # Get the price ID and plan ID from the subscription
                if subscription.items and subscription.items.data:
                    price_id = subscription.items.data[0].price.id
                    
                    # Determine if this is an annual plan
                    is_annual = PaymentHandler.is_annual_plan(price_id)
                    billing_cycle = "yearly" if is_annual else "monthly"
                    logger.info(f"Price ID {price_id} corresponds to billing cycle: {billing_cycle}")
                    
                    # Find the plan ID that corresponds to this price ID
                    plan_id = None
                    
                    # First, try the direct mapping we created from price ID to plan
                    plan_id = PRICE_TO_PLAN_MAPPING.get(price_id)
                    if plan_id:
                        logger.info(f"✅ Found plan '{plan_id}' directly from price ID mapping")
                    
                    # If not found in direct mapping, fall back to the old approach
                    if not plan_id:
                        for plan, plan_price_id in SUBSCRIPTION_PLANS.items():
                            if plan_price_id == price_id:
                                plan_id = plan
                                logger.info(f"✅ Found plan '{plan_id}' from subscription plans dictionary")
                                break
                    
                    if not plan_id:
                        logger.error(f"No matching plan found for price ID: {price_id}")
                        
                        # Check if this is an enterprise plan based on price
                        plan_amount = subscription.items.data[0].price.unit_amount
                        logger.info(f"Examining price amount for plan detection: {plan_amount}")
                        
                        # Check product name/description for additional clues
                        product_name = subscription.items.data[0].price.product
                        try:
                            product = stripe.Product.retrieve(product_name)
                            product_description = product.name
                            logger.info(f"Product name for plan detection: {product_description}")
                            
                            # Logic to determine the plan based on product name/description
                            if "enterprise" in product_description.lower():
                                logger.info("✅ Product name contains 'enterprise', setting plan to enterprise")
                                plan_id = "enterprise"
                                # Force upgrade to enterprise for any user paying for an enterprise plan
                                PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                            elif "pro" in product_description.lower():
                                logger.info("✅ Product name contains 'pro', setting plan to pro")
                                plan_id = "pro"
                                
                                # If it's an annual plan with higher price, check if it might be enterprise
                                if plan_amount >= 2000:  # $20+ is likely an annual payment
                                    logger.info(f"Annual plan detected with price {plan_amount}")
                                    if plan_amount >= 3000:  # $30+ is likely an enterprise plan
                                        logger.info("💰 High value plan detected, forcing upgrade to enterprise")
                                        plan_id = "enterprise"
                                        PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                            else:
                                logger.warning(f"Could not determine plan from product name: {product_description}")
                        except Exception as e:
                            logger.error(f"Error retrieving product: {str(e)}")
                        
                        if plan_amount and plan_amount >= 3000:  # $30.00 or more
                            logger.info(f"Price amount {plan_amount} indicates Enterprise plan")
                            plan_id = "enterprise"  # Set to enterprise for higher priced plans
                            logger.info(f"✅ Setting plan to ENTERPRISE based on price amount >= 3000")
                        else:
                            logger.info(f"Price amount {plan_amount} defaulting to Pro plan")
                            plan_id = "pro"  # Default to pro only for lower priced plans
                    else:
                        logger.error(f"No price found in subscription: {subscription_id}")
                        price_id = None
                        plan_id = "pro"  # Default to pro if no price found
                else:
                    logger.error(f"No price found in subscription: {subscription_id}")
                    price_id = None
                    plan_id = "pro"  # Default to pro if no price found
                
                # Find the user associated with this customer ID
                try:
                    from backend.database import DatabaseHandler
                    # This is a simplified approach - in a real app, you would have a mapping between
                    # Stripe customer IDs and your user IDs
                    # For now, we'll assume the user ID is stored in the subscription metadata
                    user_id = subscription.metadata.get("user_id")
                    
                    if not user_id:
                        logger.error(f"No user ID found in subscription metadata: {subscription_id}")
                        return {
                            "status": "error",
                            "message": "No user ID found in subscription metadata"
                        }
                except Exception as e:
                    logger.error(f"Error retrieving user_id from subscription metadata: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Error retrieving user data: {str(e)}"
                    }
                    
                # Get the user's email from Stripe customer
                customer_email = None
                try:
                    customer = stripe.Customer.retrieve(customer_id)
                    customer_email = customer.email
                except Exception as e:
                    logger.warning(f"Could not retrieve customer email: {str(e)}")
                
                # Update the user record with subscription details
                subscription_data = {
                    "subscription_tier": plan_id or "pro",  # Default to pro if plan_id is not found
                    "stripe_customer_id": customer_id,
                    "stripe_subscription_id": subscription_id,
                    "subscription_status": status,
                    "subscription_price_id": price_id,
                    "subscription_current_period_end": datetime.fromtimestamp(current_period_end).isoformat(),
                    "subscription_billing_cycle": billing_cycle,  # Add billing cycle information
                    "updated_at": datetime.now().isoformat()
                }
                
                logger.info(f"🔄 Updating user {user_id} subscription tier to: {plan_id or 'pro'}")
                updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                
                if updated_user:
                    logger.info(f"✅ Successfully updated user {user_id} to {plan_id} tier")
                else:
                    logger.error(f"❌ Failed to update user {user_id} to {plan_id} tier")
                
                # Then upsert the subscription record
                subscription_result = await DatabaseHandler.upsert_subscription(
                    user_id=user_id,
                    stripe_customer_id=customer_id,
                    stripe_subscription_id=subscription_id,
                    plan=plan_id or "pro",  # Default to pro if plan_id is not found
                    status=status,
                    current_period_end=datetime.fromtimestamp(current_period_end),
                    email=customer_email,
                    billing_cycle=billing_cycle  # Add billing cycle information
                )
                
                if updated_user and subscription_result:
                    logger.info(f"Successfully updated subscription for user: {user_id}")
                else:
                    logger.error(f"Failed to update subscription in database: {user_id}")
                    return {
                        "status": "error",
                        "message": f"Failed to update subscription in database: {user_id}"
                    }
                
                return {
                    "status": "success",
                    "message": f"Subscription created for customer {customer_id}",
                }
                
            elif event.type == "customer.subscription.updated":
                subscription = event.data.object
                customer_id = subscription.customer
                logger.info(f"Subscription updated for customer: {customer_id}")
                
                # Extract necessary data from the subscription
                subscription_id = subscription.id
                status = subscription.status
                current_period_end = subscription.current_period_end
                
                # Get the price ID and plan ID from the subscription
                if subscription.items and subscription.items.data:
                    price_id = subscription.items.data[0].price.id
                    
                    # Determine if this is an annual plan
                    is_annual = PaymentHandler.is_annual_plan(price_id)
                    billing_cycle = "yearly" if is_annual else "monthly"
                    logger.info(f"Price ID {price_id} corresponds to billing cycle: {billing_cycle}")
                    
                    # Find the plan ID that corresponds to this price ID
                    plan_id = None
                    
                    # First, try the direct mapping we created from price ID to plan
                    plan_id = PRICE_TO_PLAN_MAPPING.get(price_id)
                    if plan_id:
                        logger.info(f"✅ Found plan '{plan_id}' directly from price ID mapping")
                    
                    # If not found in direct mapping, fall back to the old approach
                    if not plan_id:
                        for plan, plan_price_id in SUBSCRIPTION_PLANS.items():
                            if plan_price_id == price_id:
                                plan_id = plan
                                logger.info(f"✅ Found plan '{plan_id}' from subscription plans dictionary")
                                break
                    
                    if not plan_id:
                        logger.error(f"No matching plan found for price ID: {price_id}")
                        
                        # Check if this is an enterprise plan based on price
                        plan_amount = subscription.items.data[0].price.unit_amount
                        logger.info(f"Examining price amount for plan detection: {plan_amount}")
                        
                        # Check product name/description for additional clues
                        product_name = subscription.items.data[0].price.product
                        try:
                            product = stripe.Product.retrieve(product_name)
                            product_description = product.name
                            logger.info(f"Product name for plan detection: {product_description}")
                            
                            # Logic to determine the plan based on product name/description
                            if "enterprise" in product_description.lower():
                                logger.info("✅ Product name contains 'enterprise', setting plan to enterprise")
                                plan_id = "enterprise"
                                # Force upgrade to enterprise for any user paying for an enterprise plan
                                PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                            elif "pro" in product_description.lower():
                                logger.info("✅ Product name contains 'pro', setting plan to pro")
                                plan_id = "pro"
                                
                                # If it's an annual plan with higher price, check if it might be enterprise
                                if plan_amount >= 2000:  # $20+ is likely an annual payment
                                    logger.info(f"Annual plan detected with price {plan_amount}")
                                    if plan_amount >= 3000:  # $30+ is likely an enterprise plan
                                        logger.info("💰 High value plan detected, forcing upgrade to enterprise")
                                        plan_id = "enterprise"
                                        PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                            else:
                                logger.warning(f"Could not determine plan from product name: {product_description}")
                        except Exception as e:
                            logger.error(f"Error retrieving product: {str(e)}")
                        
                        if plan_amount and plan_amount >= 3000:  # $30.00 or more
                            logger.info(f"Price amount {plan_amount} indicates Enterprise plan")
                            plan_id = "enterprise"  # Set to enterprise for higher priced plans
                        else:
                            logger.info(f"Price amount {plan_amount} defaulting to Pro plan")
                            plan_id = "pro"  # Default to pro only for lower priced plans
                    else:
                        logger.error(f"No price found in subscription: {subscription_id}")
                        price_id = None
                        plan_id = "pro"  # Default to pro if no price found
                else:
                    logger.error(f"No price found in subscription: {subscription_id}")
                    price_id = None
                    plan_id = "pro"  # Default to pro if no price found
                
                # Find the user associated with this customer ID
                try:
                    from backend.database import DatabaseHandler
                    # This is a simplified approach - in a real app, you would have a mapping between
                    # Stripe customer IDs and your user IDs
                    # For now, we'll assume the user ID is stored in the subscription metadata
                    user_id = subscription.metadata.get("user_id")
                    
                    if not user_id:
                        logger.error(f"No user ID found in subscription metadata: {subscription_id}")
                        return {
                            "status": "error",
                            "message": "No user ID found in subscription metadata"
                        }
                    
                    # Get the user's email from Stripe customer
                    customer_email = None
                    try:
                        customer = stripe.Customer.retrieve(customer_id)
                        customer_email = customer.email
                        logger.info(f"Retrieved customer email: {customer_email}")
                        
                        # Check if this is a whitelisted Enterprise user
                        if customer_email in ENTERPRISE_USERS:
                            logger.info(f"⚠️ Whitelisted Enterprise user detected: {customer_email}")
                            plan_id = "enterprise"  # Override to enterprise for whitelisted users
                            logger.info(f"Overriding plan_id to 'enterprise' for whitelisted user")
                            
                    except Exception as e:
                        logger.warning(f"Could not retrieve customer email: {str(e)}")
                    
                    # Update the user record with subscription details
                    subscription_data = {
                        "subscription_tier": plan_id or "pro",  # Default to pro if plan_id is not found
                        "stripe_subscription_id": subscription_id,
                        "subscription_status": status,
                        "subscription_price_id": price_id,
                        "subscription_current_period_end": datetime.fromtimestamp(current_period_end).isoformat(),
                        "subscription_billing_cycle": billing_cycle,  # Add billing cycle information
                        "updated_at": datetime.now().isoformat()
                    }
                    
                    logger.info(f"🔄 Updating user {user_id} subscription tier to: {plan_id or 'pro'}")
                    updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                    
                    if updated_user:
                        logger.info(f"✅ Successfully updated user {user_id} to {plan_id} tier")
                    else:
                        logger.error(f"❌ Failed to update user {user_id} to {plan_id} tier")
                    
                    # Then upsert the subscription record
                    subscription_result = await DatabaseHandler.upsert_subscription(
                        user_id=user_id,
                        stripe_customer_id=customer_id,
                        stripe_subscription_id=subscription_id,
                        plan=plan_id or "pro",  # Default to pro if plan_id is not found
                        status=status,
                        current_period_end=datetime.fromtimestamp(current_period_end),
                        email=customer_email,
                        billing_cycle=billing_cycle  # Add billing cycle information
                    )
                    
                    if updated_user and subscription_result:
                        logger.info(f"Successfully updated subscription for user: {user_id}")
                    else:
                        logger.error(f"Failed to update subscription in database: {user_id}")
                        return {
                            "status": "error",
                            "message": f"Failed to update subscription in database: {user_id}"
                        }
                except Exception as e:
                    logger.error(f"Error updating subscription in database: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Error updating subscription in database: {str(e)}"
                    }
                
                return {
                    "status": "success",
                    "message": f"Subscription updated for customer {customer_id}",
                }
                
            elif event.type == "customer.subscription.deleted":
                subscription = event.data.object
                customer_id = subscription.customer
                logger.info(f"Subscription deleted for customer: {customer_id}")
                
                try:
                    from backend.database import DatabaseHandler
                    # This is a simplified approach - in a real app, you would have a mapping between
                    # Stripe customer IDs and your user IDs
                    # For now, we'll assume the user ID is stored in the subscription metadata
                    user_id = subscription.metadata.get("user_id")
                    
                    if not user_id:
                        logger.error(f"No user ID found in subscription metadata: {subscription.id}")
                        return {
                            "status": "error",
                            "message": "No user ID found in subscription metadata"
                        }
                    
                    # Get the user's email from Stripe customer
                    customer_email = None
                    try:
                        customer = stripe.Customer.retrieve(customer_id)
                        customer_email = customer.email
                    except Exception as e:
                        logger.warning(f"Could not retrieve customer email: {str(e)}")
                    
                    # Update the user record with subscription details
                    subscription_data = {
                        "subscription_tier": "free",  # Downgrade to free tier
                        "subscription_status": "canceled",
                        "subscription_current_period_end": datetime.fromtimestamp(subscription.current_period_end).isoformat(),
                        "subscription_billing_cycle": "monthly",  # Downgrade to monthly billing cycle
                        "updated_at": datetime.now().isoformat()
                    }
                    
                    updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                    
                    # Then upsert the subscription record
                    subscription_result = await DatabaseHandler.upsert_subscription(
                        user_id=user_id,
                        stripe_customer_id=customer_id,
                        stripe_subscription_id=subscription.id,
                        plan="free",  # Downgrade to free tier
                        status="canceled",
                        current_period_end=datetime.fromtimestamp(subscription.current_period_end),
                        email=customer_email,
                        billing_cycle="monthly"  # Downgrade to monthly billing cycle
                    )
                    
                    if updated_user and subscription_result:
                        logger.info(f"Successfully updated subscription for user: {user_id}")
                    else:
                        logger.error(f"Failed to update subscription in database: {user_id}")
                        return {
                            "status": "error",
                            "message": f"Failed to update subscription in database: {user_id}"
                        }
                except Exception as e:
                    logger.error(f"Error handling subscription deletion: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Error handling subscription deletion: {str(e)}"
                    }
                
                return {
                    "status": "success",
                    "message": f"Subscription deleted for customer {customer_id}",
                }
                
            elif event.type == "invoice.paid":
                invoice = event.data.object
                customer_id = invoice.customer
                logger.info(f"Invoice paid for customer: {customer_id}")
                
                # Get the subscription ID from the invoice
                subscription_id = invoice.subscription
                
                if not subscription_id:
                    logger.warning(f"No subscription ID found in invoice: {invoice.id}")
                    return {
                        "status": "success",
                        "message": f"Invoice paid for customer {customer_id} (no subscription)"
                    }
                
                try:
                    # Retrieve the subscription details from Stripe
                    subscription = stripe.Subscription.retrieve(subscription_id)
                    current_period_end = subscription.current_period_end
                    status = subscription.status
                    
                    # Get the price ID from the subscription
                    if subscription.items and subscription.items.data:
                        price_id = subscription.items.data[0].price.id
                        
                        # Determine if this is an annual plan
                        is_annual = PaymentHandler.is_annual_plan(price_id)
                        billing_cycle = "yearly" if is_annual else "monthly"
                        logger.info(f"Price ID {price_id} corresponds to billing cycle: {billing_cycle}")
                        
                        # Find the plan ID that corresponds to this price ID
                        plan_id = None
                        
                        # First, try the direct mapping we created from price ID to plan
                        plan_id = PRICE_TO_PLAN_MAPPING.get(price_id)
                        if plan_id:
                            logger.info(f"✅ Found plan '{plan_id}' directly from price ID mapping for invoice.paid")
                        
                        # If not found in direct mapping, fall back to the old approach
                        if not plan_id:
                            for plan, plan_price_id in SUBSCRIPTION_PLANS.items():
                                if plan_price_id == price_id:
                                    plan_id = plan
                                    logger.info(f"✅ Found plan '{plan_id}' from subscription plans dictionary for invoice.paid")
                                    break
                        
                        if not plan_id:
                            logger.error(f"No matching plan found for price ID: {price_id}")
                            
                            # Check if this is an enterprise plan based on price
                            plan_amount = subscription.items.data[0].price.unit_amount
                            logger.info(f"Examining price amount for plan detection: {plan_amount}")
                            
                            # Check product name/description for additional clues
                            product_name = subscription.items.data[0].price.product
                            try:
                                product = stripe.Product.retrieve(product_name)
                                product_description = product.name
                                logger.info(f"Product name for plan detection: {product_description}")
                                
                                # Logic to determine the plan based on product name/description
                                if "enterprise" in product_description.lower():
                                    logger.info("✅ Product name contains 'enterprise', setting plan to enterprise")
                                    plan_id = "enterprise"
                                    # Force upgrade to enterprise for any user paying for an enterprise plan
                                    PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                                elif "pro" in product_description.lower():
                                    logger.info("✅ Product name contains 'pro', setting plan to pro")
                                    plan_id = "pro"
                                    
                                    # If it's an annual plan with higher price, check if it might be enterprise
                                    if plan_amount >= 2000:  # $20+ is likely an annual payment
                                        logger.info(f"Annual plan detected with price {plan_amount}")
                                        if plan_amount >= 3000:  # $30+ is likely an enterprise plan
                                            logger.info("💰 High value plan detected, forcing upgrade to enterprise")
                                            plan_id = "enterprise"
                                            PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                                else:
                                    logger.warning(f"Could not determine plan from product name: {product_description}")
                            except Exception as e:
                                logger.error(f"Error retrieving product: {str(e)}")
                            
                            if plan_amount and plan_amount >= 3000:  # $30.00 or more
                                logger.info(f"Price amount {plan_amount} indicates Enterprise plan")
                                plan_id = "enterprise"  # Set to enterprise for higher priced plans
                            else:
                                logger.info(f"Price amount {plan_amount} defaulting to Pro plan")
                                plan_id = "pro"  # Default to pro only for lower priced plans
                        else:
                            logger.error(f"No price found in subscription: {subscription_id}")
                            price_id = None
                            plan_id = "pro"  # Default to pro if no price found
                        
                        # Get the user ID from the subscription metadata
                        user_id = subscription.metadata.get("user_id")
                        
                        # If no user_id in metadata, try to find the user by customer ID
                        if not user_id:
                            logger.warning(f"No user ID found in subscription metadata, using customer ID: {customer_id}")
                            user_id = customer_id
                        
                        # Get the customer email
                        customer_email = None
                        try:
                            customer = stripe.Customer.retrieve(customer_id)
                            customer_email = customer.email
                            logger.info(f"Retrieved customer email for invoice.paid: {customer_email}")
                            
                            # Check if this is a whitelisted Enterprise user
                            if customer_email in ENTERPRISE_USERS:
                                logger.info(f"⚠️ Whitelisted Enterprise user detected: {customer_email}")
                                plan_id = "enterprise"  # Override to enterprise for whitelisted users
                                logger.info(f"Overriding plan_id to 'enterprise' for whitelisted user")
                        except Exception as e:
                            logger.warning(f"Could not retrieve customer email: {str(e)}")
                        
                        # Check if this should be an Enterprise plan based on the invoice amount
                        invoice_amount = invoice.amount_paid
                        if invoice_amount >= 3000:  # $30.00 or more in cents
                            logger.info(f"Invoice amount {invoice_amount} indicates Enterprise plan")
                            # Ensure this gets set to enterprise regardless of other checks
                            plan_id = "enterprise"
                            
                            # As a safeguard, force upgrade to enterprise if the amount matches
                            logger.info(f"🔍 Triggering force upgrade to Enterprise for user {user_id} based on invoice amount")
                            force_result = await PaymentHandler.force_upgrade_to_enterprise(
                                user_id=user_id, 
                                customer_id=customer_id,
                                subscription_id=subscription_id,
                                customer_email=customer_email
                            )
                            logger.info(f"Force upgrade result: {force_result}")
                        
                        # Update the subscription in the database
                        from backend.database import DatabaseHandler
                        
                        # Determine if this is an annual plan
                        is_annual = PaymentHandler.is_annual_plan(price_id)
                        billing_cycle = "yearly" if is_annual else "monthly"
                        logger.info(f"Price ID {price_id} corresponds to billing cycle: {billing_cycle}")
                        
                        # Upsert the subscription record
                        subscription_result = await DatabaseHandler.upsert_subscription(
                            user_id=user_id,
                            stripe_customer_id=customer_id,
                            stripe_subscription_id=subscription_id,
                            plan=plan_id,
                            status=status,
                            current_period_end=datetime.fromtimestamp(current_period_end),
                            email=customer_email,
                            billing_cycle=billing_cycle  # Add billing cycle information
                        )
                        
                        if subscription_result:
                            logger.info(f"Successfully updated subscription for invoice: {invoice.id}")
                            return {
                                "status": "success",
                                "message": f"Subscription updated for invoice: {invoice.id}"
                            }
                        else:
                            logger.error(f"Failed to update subscription for invoice: {invoice.id}")
                            return {
                                "status": "error",
                                "message": f"Failed to update subscription for invoice: {invoice.id}"
                            }
                except Exception as e:
                        logger.error(f"Error processing invoice.paid: {str(e)}")
                        return {
                            "status": "error",
                            "message": f"Error processing invoice: {str(e)}"
                        }
                
                except Exception as e:
                    logger.error(f"Error processing invoice.paid: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Error processing invoice: {str(e)}"
                    }
                
                return {
                    "status": "success",
                    "message": f"Invoice paid for customer {customer_id}",
                }
                
            elif event.type == "invoice.payment_failed":
                invoice = event.data.object
                customer_id = invoice.customer
                logger.info(f"Invoice payment failed for customer: {customer_id}")
                
                # TODO: Handle failed payment in database
                
                return {
                    "status": "success",
                    "message": f"Invoice payment failed for customer {customer_id}",
                }
            
            elif event.type == "invoice.payment_succeeded":
                invoice = event.data.object
                customer_id = invoice.customer
                logger.info(f"Invoice payment succeeded for customer: {customer_id}")
                
                # Get the subscription ID from the invoice
                subscription_id = invoice.subscription
                
                if not subscription_id:
                    logger.error(f"No subscription ID found in invoice: {invoice.id}")
                    return {
                        "status": "error",
                        "message": "No subscription ID found in invoice"
                    }
                
                try:
                    # Retrieve the subscription details from Stripe
                    subscription = stripe.Subscription.retrieve(subscription_id)
                    current_period_end = subscription.current_period_end
                    status = subscription.status
                    
                    # Get the price ID from the subscription
                    if subscription.items and subscription.items.data:
                        price_id = subscription.items.data[0].price.id
                        
                        # Determine if this is an annual plan
                        is_annual = PaymentHandler.is_annual_plan(price_id)
                        billing_cycle = "yearly" if is_annual else "monthly"
                        logger.info(f"Price ID {price_id} corresponds to billing cycle: {billing_cycle}")
                        
                        # Find the plan ID that corresponds to this price ID
                        plan_id = None
                        
                        # First, try the direct mapping we created from price ID to plan
                        plan_id = PRICE_TO_PLAN_MAPPING.get(price_id)
                        if plan_id:
                            logger.info(f"✅ Found plan '{plan_id}' directly from price ID mapping for payment_succeeded")
                        
                        # If not found in direct mapping, fall back to the old approach
                        if not plan_id:
                            for plan, plan_price_id in SUBSCRIPTION_PLANS.items():
                                if plan_price_id == price_id:
                                    plan_id = plan
                                    logger.info(f"✅ Found plan '{plan_id}' from subscription plans dictionary for payment_succeeded")
                                    break
                        
                        if not plan_id:
                            logger.error(f"No matching plan found for price ID: {price_id}")
                            
                            # Check if this is an enterprise plan based on price
                            plan_amount = subscription.items.data[0].price.unit_amount
                            logger.info(f"Examining price amount for plan detection: {plan_amount}")
                            
                            # Check product name/description for additional clues
                            product_name = subscription.items.data[0].price.product
                            try:
                                product = stripe.Product.retrieve(product_name)
                                product_description = product.name
                                logger.info(f"Product name for plan detection: {product_description}")
                                
                                # Logic to determine the plan based on product name/description
                                if "enterprise" in product_description.lower():
                                    logger.info("✅ Product name contains 'enterprise', setting plan to enterprise")
                                    plan_id = "enterprise"
                                    # Force upgrade to enterprise for any user paying for an enterprise plan
                                    PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                                elif "pro" in product_description.lower():
                                    logger.info("✅ Product name contains 'pro', setting plan to pro")
                                    plan_id = "pro"
                                    
                                    # If it's an annual plan with higher price, check if it might be enterprise
                                    if plan_amount >= 2000:  # $20+ is likely an annual payment
                                        logger.info(f"Annual plan detected with price {plan_amount}")
                                        if plan_amount >= 3000:  # $30+ is likely an enterprise plan
                                            logger.info("💰 High value plan detected, forcing upgrade to enterprise")
                                            plan_id = "enterprise"
                                            PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                                else:
                                    logger.warning(f"Could not determine plan from product name: {product_description}")
                            except Exception as e:
                                logger.error(f"Error retrieving product: {str(e)}")
                            
                            if plan_amount and plan_amount >= 3000:  # $30.00 or more
                                logger.info(f"Price amount {plan_amount} indicates Enterprise plan")
                                plan_id = "enterprise"  # Set to enterprise for higher priced plans
                            else:
                                logger.info(f"Price amount {plan_amount} defaulting to Pro plan")
                                plan_id = "pro"  # Default to pro only for lower priced plans
                        else:
                            logger.error(f"No price found in subscription: {subscription_id}")
                            price_id = None
                            plan_id = "pro"  # Default to pro if no price found
                        
                        # Get the user ID from the subscription metadata
                        user_id = subscription.metadata.get("user_id")
                        
                        # If no user_id in metadata, try to find the user by customer ID
                        if not user_id:
                            logger.warning(f"No user ID found in subscription metadata, using customer ID: {customer_id}")
                            user_id = customer_id
                        
                        # Get the customer email
                        customer_email = None
                        try:
                            customer = stripe.Customer.retrieve(customer_id)
                            customer_email = customer.email
                            logger.info(f"Retrieved customer email for invoice.paid: {customer_email}")
                            
                            # Check if this is a whitelisted Enterprise user
                            if customer_email in ENTERPRISE_USERS:
                                logger.info(f"⚠️ Whitelisted Enterprise user detected: {customer_email}")
                                plan_id = "enterprise"  # Override to enterprise for whitelisted users
                                logger.info(f"Overriding plan_id to 'enterprise' for whitelisted user")
                        except Exception as e:
                            logger.warning(f"Could not retrieve customer email: {str(e)}")
                        
                        # Check if this is a high-value payment that should trigger Enterprise tier
                        invoice_amount = invoice.amount_paid
                        if invoice_amount >= 3000:  # $30.00 or more in cents
                            logger.info(f"💵 Payment amount {invoice_amount} confirms Enterprise plan")
                            # Force the plan to enterprise regardless of other checks
                            plan_id = "enterprise"
                            
                            # Double-check with a forced upgrade to ensure the user gets Enterprise tier
                            logger.info(f"🔍 Triggering force upgrade to Enterprise for user {user_id} based on payment amount")
                            force_result = await PaymentHandler.force_upgrade_to_enterprise(
                                user_id=user_id,
                                customer_id=customer_id,
                                subscription_id=subscription_id,
                                customer_email=customer_email
                            )
                            logger.info(f"Force upgrade result: {force_result}")
                        
                        # Update the subscription in the database
                        from backend.database import DatabaseHandler
                        
                        # Determine if this is an annual plan
                        is_annual = PaymentHandler.is_annual_plan(price_id)
                        billing_cycle = "yearly" if is_annual else "monthly"
                        logger.info(f"Price ID {price_id} corresponds to billing cycle: {billing_cycle}")
                        
                        # Upsert the subscription record
                        subscription_result = await DatabaseHandler.upsert_subscription(
                            user_id=user_id,
                            stripe_customer_id=customer_id,
                            stripe_subscription_id=subscription_id,
                            plan=plan_id,
                            status=status,
                            current_period_end=datetime.fromtimestamp(current_period_end),
                            email=customer_email,
                            billing_cycle=billing_cycle  # Add billing cycle information
                        )
                        
                        if subscription_result:
                            logger.info(f"Successfully updated subscription for invoice payment: {invoice.id}")
                            return {
                                "status": "success",
                                "message": f"Subscription updated for invoice payment: {invoice.id}"
                            }
                        else:
                            logger.error(f"Failed to update subscription for invoice payment: {invoice.id}")
                            return {
                                "status": "error",
                                "message": f"Failed to update subscription for invoice payment: {invoice.id}"
                            }
                except Exception as e:
                        logger.error(f"Error processing invoice.payment_succeeded: {str(e)}")
                        return {
                            "status": "error",
                            "message": f"Error processing invoice payment: {str(e)}"
                        }
                except Exception as e:
                    logger.error(f"Error processing invoice.payment_succeeded: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Error processing invoice payment: {str(e)}"
                    }
            
            # Return a response for unhandled event types
            return {
                "status": "success",
                "message": f"Unhandled event type: {event.type}",
            }
        except ValueError as e:
            logger.error(f"Error verifying webhook signature: {str(e)}")
            return {
                "status": "error",
                "message": f"Error verifying webhook signature: {str(e)}",
                }
        except Exception as e:
            logger.error(f"Error handling webhook: {str(e)}")
            return {
                "status": "error",
                "message": f"Error handling webhook: {str(e)}",
            }
    
    @staticmethod
    async def create_api_usage_record(
        customer_id: str,
        quantity: int
    ) -> Dict[str, Any]:
        """
        Creates a usage record for API usage.
        
        Args:
            customer_id: The Stripe customer ID
            quantity: The number of images processed
            
        Returns:
            Dict[str, Any]: The usage record details
        """
        try:
            # Get the subscription item ID
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                limit=1,
            )
            
            if not subscriptions.data:
                raise Exception(f"No subscription found for customer {customer_id}")
            
            subscription = subscriptions.data[0]
            subscription_item_id = subscription.items.data[0].id
            
            # Create a usage record
            usage_record = stripe.SubscriptionItem.create_usage_record(
                subscription_item_id,
                quantity=quantity,
                timestamp=int(datetime.now().timestamp()),
                action="increment",
            )
            
            return {
                "status": "success",
                "usage_record_id": usage_record.id,
                "quantity": quantity,
            }
        except Exception as e:
            logger.error(f"Error creating API usage record: {str(e)}")
            raise
    
    @staticmethod
    async def check_and_apply_enterprise_upgrade(event=None, customer_id=None):
        """
        Check if a user should be on the Enterprise plan and apply the upgrade if needed.
        Called for all webhook events to ensure Enterprise users are correctly identified.
        """
        try:
            if not customer_id and event and hasattr(event.data.object, 'customer'):
                customer_id = event.data.object.customer
                
            if not customer_id:
                logger.warning("Cannot check for enterprise upgrade: No customer ID available")
                return
                
            # Try to get user email from customer ID
            customer_email = None
            user_id = None
            
            try:
                # Get customer information from Stripe
                customer = stripe.Customer.retrieve(customer_id)
                customer_email = customer.email
                logger.info(f"Retrieved customer email for enterprise check: {customer_email}")
                
                # Get user ID from our database
                from backend.database import DatabaseHandler
                user = await DatabaseHandler.get_user_by_email(customer_email)
                if user:
                    user_id = user.get("id")
                    logger.info(f"Found user ID for enterprise check: {user_id}")
                else:
                    logger.warning(f"No user found for email {customer_email}")
            except Exception as e:
                logger.error(f"Error retrieving customer data: {str(e)}")
                
            # Force upgrade if user is in the enterprise whitelist
            if customer_email and customer_email in ENTERPRISE_USERS:
                logger.info(f"Customer {customer_email} is in ENTERPRISE_USERS whitelist")
                await PaymentHandler.force_upgrade_to_enterprise(user_id, customer_email)
                
            return True
        except Exception as e:
            logger.error(f"Error in check_and_apply_enterprise_upgrade: {str(e)}")
            return False
            
    @staticmethod
    async def force_upgrade_to_enterprise(user_id, customer_email=None):
        """
        Force upgrade a user to the Enterprise tier.
        """
        if not user_id:
            logger.error("Cannot force upgrade: No user ID provided")
            return False
            
        try:
            logger.info(f"⚡ Forcing upgrade to Enterprise tier for user {user_id}")
            
            # Import here to avoid circular imports
            from backend.database import DatabaseHandler
            
            # Update user subscription tier
            subscription_data = {
                "subscription_tier": "enterprise",
                "subscription_status": "active",
                "updated_at": datetime.now().isoformat()
            }
            
            # Update the user record
            updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
            
            if updated_user:
                logger.info(f"✅ Successfully forced upgrade to Enterprise for user {user_id}")
                
                # Also log the customer email for tracking
                if customer_email:
                    logger.info(f"Customer email for forced upgrade: {customer_email}")
                
                return True
            else:
                logger.error(f"❌ Failed to force upgrade user {user_id} to Enterprise tier")
                return False
        except Exception as e:
            logger.error(f"Error in force_upgrade_to_enterprise: {str(e)}")
            return False
    
    @staticmethod
    async def manual_fix_subscription_by_email(
        email: str,
        target_plan: str = "enterprise"
    ) -> Dict[str, Any]:
        """
        Manually fix a user's subscription by email address.
        Used for customer support and fixing issues with subscription plans.
        
        Args:
            email: The user's email address
            target_plan: The plan to set the user to (default: enterprise)
            
        Returns:
            Dict[str, Any]: Result of the operation
        """
        try:
            from backend.database import DatabaseHandler
            
            # First, find the user by email
            logger.info(f"🔎 Looking for user with email: {email}")
            user = await DatabaseHandler.get_user_by_email(email)
            
            if not user:
                logger.error(f"❌ User with email {email} not found")
                return {
                    "status": "error",
                    "message": f"User with email {email} not found"
                }
                
            user_id = user.get("id")
            current_tier = user.get("subscription_tier", "free")
            
            logger.info(f"✅ Found user {user_id} with current tier: {current_tier}")
            
            # If already on target plan, nothing to do
            if current_tier == target_plan:
                logger.info(f"User {user_id} is already on {target_plan} tier")
                return {
                    "status": "success",
                    "message": f"User already on {target_plan} tier"
                }
                
            # Update the user's subscription tier
            subscription_data = {
                "subscription_tier": target_plan,
                "updated_at": datetime.now().isoformat()
            }
                
            # Update user record
            logger.info(f"🔄 Manually upgrading user {user_id} from {current_tier} to {target_plan} tier")
            updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
            
            if updated_user:
                logger.info(f"✅ Successfully fixed user {user_id} to {target_plan} tier")
                return {
                    "status": "success",
                    "message": f"Successfully updated {email} to {target_plan} tier"
                }
            else:
                logger.error(f"❌ Failed to manually update user {user_id} to {target_plan} tier")
                return {
                    "status": "error",
                    "message": f"Failed to update user to {target_plan} tier"
                }
                
        except Exception as e:
            logger.error(f"Error in manual_fix_subscription_by_email: {str(e)}")
            return {
                "status": "error",
                "message": f"Error updating user: {str(e)}"
            } 
