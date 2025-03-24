import os
import logging
import stripe
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from datetime import datetime, timedelta

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

# Add annual price IDs
ANNUAL_PRICE_IDS = {
    "pro_annual": "price_1R1UWMBQ1z6vW0DwRkcoXWT7",
    "enterprise_annual": "price_1R1UXlBQ1z6vW0DwMaBDmKaZ",
}

# Add reversed mapping from price ID to plan for lookup
PRICE_TO_PLAN_MAPPING = {}
for plan, price_id in SUBSCRIPTION_PLANS.items():
    PRICE_TO_PLAN_MAPPING[price_id] = plan

# Also add the annual price IDs
PRICE_TO_PLAN_MAPPING["price_1R1UWMBQ1z6vW0DwRkcoXWT7"] = "pro"  # Annual Pro plan
PRICE_TO_PLAN_MAPPING["price_1R1UXlBQ1z6vW0DwMaBDmKaZ"] = "enterprise"  # Annual Enterprise plan

# CRITICAL FIX: Ensure enterprise monthly price ID is correctly mapped
PRICE_TO_PLAN_MAPPING["price_1R1UWzBQ1z6vW0DwRDLKndlG"] = "enterprise"  # Monthly Enterprise plan

# Known Enterprise price IDs (hardcoded for reliability)
ENTERPRISE_PRICE_IDS = [
    "price_1R1UWzBQ1z6vW0DwRDLKndlG",  # Monthly Enterprise
    "price_1R1UXlBQ1z6vW0DwMaBDmKaZ",  # Annual Enterprise
]

# Define as a dictionary for easier lookup
ENTERPRISE_PRICE_ID_DICT = {
    "monthly": "price_1R1UWzBQ1z6vW0DwRDLKndlG",
    "yearly": "price_1R1UXlBQ1z6vW0DwMaBDmKaZ"
}

# Log a debug message for each enterprise price ID to ensure it maps correctly
for price_id in ENTERPRISE_PRICE_IDS:
    plan = PRICE_TO_PLAN_MAPPING.get(price_id)
    logger.info(f"Enterprise price ID mapping check: {price_id} maps to plan: {plan}")
    
    # CRITICAL FIX: Ensure all enterprise price IDs map to enterprise
    if plan != "enterprise":
        logger.error(f"CRITICAL ERROR: Enterprise price ID {price_id} does not map to enterprise plan!")
        # Fix the mapping
        PRICE_TO_PLAN_MAPPING[price_id] = "enterprise"
        logger.info(f"Fixed mapping for {price_id} to enterprise")
        
# Double check the mapping is correct now
for price_id in ENTERPRISE_PRICE_IDS:
    plan = PRICE_TO_PLAN_MAPPING.get(price_id)
    logger.info(f"VERIFICATION: {price_id} now maps to plan: {plan}")

# Log the final price mapping for debugging
logger.info(f"PRICE_TO_PLAN_MAPPING: {PRICE_TO_PLAN_MAPPING}")

# Emergency whitelist for users who should be on Enterprise plan
ENTERPRISE_USERS = [
    "anna.biel89@outlook.com",
    "beauve-ra@outlook.com",
    "simballo@outlook.com",
]

# Log available plans
logger.info(f"Available Stripe subscription plans: {SUBSCRIPTION_PLANS}")
logger.info(f"Price ID to Plan mapping: {PRICE_TO_PLAN_MAPPING}")

# API usage pricing
API_USAGE_PRICE_ID = os.getenv("STRIPE_API_USAGE_PRICE_ID", "price_0987654321")
API_PRICE_PER_IMAGE = 0.003  # $0.003 per image processed via API

class PaymentHandler:
    """
    Handles Stripe payments and subscriptions.
    """
    
    @staticmethod
    async def create_checkout_session(
        user_id: str,
        plan_id: str,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """
        Create a Stripe checkout session for a subscription plan.
        
        Args:
            user_id: The user's ID
            plan_id: The subscription plan ID
            success_url: The URL to redirect to on successful payment
            cancel_url: The URL to redirect to on cancellation
            
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
            logger.info(f"📦 Creating checkout session for user {user_id} and plan {plan_id}")
            
            # Set up price ID based on plan
            # The most critical part - ensure Enterprise tier is correctly mapped
            if plan_id == "enterprise":
                # Always use the explicit Enterprise price ID
                price_id = "price_1R1UWzBQ1z6vW0DwRDLKndlG"  # Monthly Enterprise price ID
                logger.info(f"🔒 Enterprise plan selected, using Enterprise price_id: {price_id}")
            elif plan_id == "pro":
                # Pro tier price ID
                price_id = "price_1R1UVUBQ1z6vW0DwWfGtyIW0"  # Monthly Pro price ID
                logger.info(f"Pro plan selected, using Pro price_id: {price_id}")
            else:
                logger.error(f"Unexpected plan ID: {plan_id}, defaulting to Pro")
                price_id = "price_1R1UVUBQ1z6vW0DwWfGtyIW0"  # Default to Pro
            
            # Create rich metadata to track the plan intent
            metadata = {
                "user_id": user_id,
                "plan_id": plan_id,  # Store the intended plan in metadata
                "billing_cycle": "monthly",
                "price_id": price_id,  # Also store the price ID for double verification
                "created_at": datetime.now().isoformat(),
                "is_enterprise": "true" if plan_id == "enterprise" else "false",  # Add explicit flag
            }
            
            logger.info(f"📝 Session metadata: {metadata}")
            
            # Create the checkout session with metadata to track the plan
            checkout_session = stripe.checkout.Session.create(
                success_url=success_url,
                cancel_url=cancel_url,
                mode="subscription",
                line_items=[{
                    "price": price_id,
                    "quantity": 1
                }],
                metadata=metadata,
                expand=['line_items']  # Expand line_items for more debug information
            )
            
            # Double check the created session
            if checkout_session.line_items:
                logger.info(f"✅ Session created with line items: {checkout_session.line_items}")
                
                # Log the price details
                for item in checkout_session.line_items.data:
                    logger.info(f"🏷️ Price: {item.price.id}, Amount: {item.price.unit_amount}, Product: {item.price.product}")
            
            logger.info(f"✅ Checkout session created successfully: {checkout_session.id}")
            logger.info(f"🔗 Checkout URL: {checkout_session.url}")
            
            return {
                "status": "success",
                "url": checkout_session.url,
                "session_id": checkout_session.id,
                "plan_id": plan_id,  # Return the plan ID for verification
                "price_id": price_id  # Return the price ID for verification
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
            
            logger.info(f"⚡ Received Stripe webhook event: {event.type}")
            logger.info(f"Event ID: {event.id}")
            
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
                logger.info(f"🔍 Intended plan from checkout session metadata: {intended_plan_id}")
                
                # URGENT: Test Enterprise detection
                if "enterprise" in str(session).lower():
                    logger.info("🔎 Possible Enterprise plan detected in session data")
                
                # URGENT: Check if the metadata contains enterprise in any form
                for key, value in session.metadata.items():
                    logger.info(f"📌 Session metadata: {key} = {value}")
                    if "enterprise" in str(value).lower():
                        logger.info(f"⭐ Enterprise found in metadata key {key}")
                        
                # Log the entire session in detail for debugging
                try:
                    import json
                    session_dict = session.to_dict()
                    logger.info(f"🔍 FULL SESSION DATA: {json.dumps(session_dict, indent=2)}")
                except Exception as e:
                    logger.warning(f"Could not convert session to dict: {str(e)}")
                    logger.info(f"🔍 SESSION STRINGIFIED: {str(session)}")
                
                if not user_id or not subscription_id:
                    logger.error(f"Missing required data in checkout session: user_id={user_id}, subscription_id={subscription_id}")
                    return {
                        "status": "error",
                        "message": "Missing required data in checkout session"
                    }
                
                # Critical Fix: Add direct database query to check if user exists before proceeding
                # This helps diagnose if the user ID is valid in our system
                try:
                    from backend.database import DatabaseHandler
                    existing_user = await DatabaseHandler.get_user(user_id)
                    if not existing_user:
                        logger.error(f"⚠️ USER NOT FOUND in database: {user_id}")
                    else:
                        logger.info(f"✅ User confirmed in database: {user_id}, current tier: {existing_user.get('subscription_tier', 'unknown')}")
                        
                        # Get user email for debugging
                        user_email = existing_user.get('email')
                        if user_email:
                            logger.info(f"User email: {user_email}")
                except Exception as e:
                    logger.error(f"Error checking user existence: {str(e)}")
                
                # IMPORTANT FIX: Set the plan_id early based on metadata, which is the source of truth
                # This ensures even if later checks fail, we use the intended plan from checkout
                plan_id = intended_plan_id
                
                # If plan_id is not set from metadata (which should be rare), default to "pro"
                if not plan_id:
                    plan_id = "pro"
                    logger.info(f"No plan_id found in session metadata, defaulting to pro")
                
                # If intended plan is enterprise, log this important information
                if plan_id == "enterprise":
                    logger.info("🔒 Plan is ENTERPRISE based on session metadata")
                
                # Retrieve the subscription details from Stripe for additional verification
                try:
                    subscription = stripe.Subscription.retrieve(subscription_id)
                    current_period_end = subscription.current_period_end
                    status = subscription.status
                    
                    # CRITICAL ENTERPRISE FIX: Look for the Enterprise Price ID directly in the subscription for immediate detection
                    # This should catch any Enterprise plan upgrades reliably regardless of other processing
                    enterprise_detected = False
                    try:
                        if subscription.items and subscription.items.data:
                            subscription_price_id = subscription.items.data[0].price.id
                            logger.info(f"🔎 Direct price ID check: {subscription_price_id}")
                            
                            # Check if this is specifically the Enterprise price ID
                            if subscription_price_id in ENTERPRISE_PRICE_IDS:
                                logger.info(f"🚨 ENTERPRISE DIRECT DETECTION: Found Enterprise price ID {subscription_price_id}")
                                plan_id = "enterprise"
                                enterprise_detected = True
                                
                                # Force Enterprise plan - don't wait for normal processing
                                from supabase import create_client
                                SUPABASE_URL = os.getenv("SUPABASE_URL")
                                SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                                
                                if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                                    logger.info(f"⚡ IMMEDIATE ENTERPRISE UPDATE for user {user_id}")
                                    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                                    
                                    # Force enterprise with a direct update
                                    emergency_update = supabase.table("users").update({
                                        "subscription_tier": "enterprise", 
                                        "updated_at": datetime.now().isoformat()
                                    }).eq("id", user_id).execute()
                                    
                                    if emergency_update.data and len(emergency_update.data) > 0:
                                        logger.info(f"✅ IMMEDIATE ENTERPRISE UPDATE successful")
                                    else:
                                        logger.error(f"❌ IMMEDIATE ENTERPRISE UPDATE failed")
                    except Exception as e:
                        logger.error(f"Error in direct Enterprise detection: {str(e)}")
                    
                    # Check the price ID from the subscription
                    if subscription.items and subscription.items.data:
                        price_id = subscription.items.data[0].price.id
                        price_amount = subscription.items.data[0].price.unit_amount
                        
                        # Log the detected price
                        logger.info(f"💰 Price ID from subscription: {price_id}, Amount: {price_amount}")
                        
                        # Check against known Enterprise price IDs
                        if price_id in ENTERPRISE_PRICE_IDS:
                            logger.info(f"⚠️ CRITICAL ENTERPRISE DETECTION: Price ID {price_id} is a KNOWN ENTERPRISE price ID")
                            plan_id = "enterprise"  # Override with enterprise
                            logger.info(f"✅ Setting plan to ENTERPRISE based on price ID: {price_id}")
                            
                            # CRITICAL ENTERPRISE FIX: Force a direct update when enterprise price ID is detected
                            try:
                                from supabase import create_client
                                SUPABASE_URL = os.getenv("SUPABASE_URL")
                                SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                                
                                if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                                    logger.info(f"⚠️ CRITICAL ENTERPRISE FIX: Directly updating user {user_id} to Enterprise based on price ID")
                                    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                                    
                                    # Update user record with a direct SQL update that cannot be ignored
                                    direct_update = supabase.table("users").update({
                                        "subscription_tier": "enterprise",
                                        "updated_at": datetime.now().isoformat()
                                    }).eq("id", user_id).execute()
                                    
                                    if direct_update.data and len(direct_update.data) > 0:
                                        logger.info(f"✅ CRITICAL ENTERPRISE FIX: Successfully set to enterprise via direct SQL")
                                        
                                        # Also update subscription record
                                        try:
                                            sub_check = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
                                            
                                            subscription_data = {
                                                "user_id": user_id,
                                                "plan": "enterprise",
                                                "status": status,
                                                "stripe_customer_id": customer_id,
                                                "stripe_subscription_id": subscription_id,
                                                "updated_at": datetime.now().isoformat(),
                                                "billing_cycle": session.metadata.get("billing_cycle", "monthly")
                                            }
                                            
                                            if current_period_end:
                                                subscription_data["current_period_end"] = datetime.fromtimestamp(current_period_end)
                                            
                                            if customer_email:
                                                subscription_data["email"] = customer_email
                                            
                                            if sub_check.data and len(sub_check.data) > 0:
                                                # Update existing
                                                supabase.table("subscriptions").update(subscription_data).eq("user_id", user_id).execute()
                                            else:
                                                # Insert new
                                                supabase.table("subscriptions").insert(subscription_data).execute()
                                            
                                            logger.info(f"✅ CRITICAL ENTERPRISE FIX: Subscription record updated")
                                        except Exception as e:
                                            logger.error(f"Error updating subscription record: {str(e)}")
                                        
                                        # Also update user metadata
                                        try:
                                            auth_update = supabase.auth.admin.update_user_by_id(
                                                user_id,
                                                user_metadata={
                                                    "subscription_tier": "enterprise",
                                                    "subscription_status": "active",
                                                    "updated_at": datetime.now().isoformat()
                                                }
                                            )
                                            logger.info(f"✅ CRITICAL ENTERPRISE FIX: Auth metadata updated")
                                        except Exception as e:
                                            logger.error(f"Error updating auth metadata: {str(e)}")
                                    else:
                                        logger.error(f"❌ CRITICAL ENTERPRISE FIX: Failed to update user")
                            except Exception as e:
                                logger.error(f"❌ CRITICAL ENTERPRISE FIX: Error: {str(e)}")
                        
                        # Check price amount (Enterprise is $30+)
                        if price_amount and price_amount >= 3000:  # $30.00 or more in cents
                            plan_id = "enterprise"  # Override with enterprise
                            logger.info(f"✅ Setting plan to ENTERPRISE based on price amount: {price_amount} >= 3000")
                        
                        # Check product name for additional confirmation
                        product_id = subscription.items.data[0].price.product
                        try:
                            product = stripe.Product.retrieve(product_id)
                            logger.info(f"📦 Product name: {product.name}, ID: {product_id}")
                            
                            if product.name and "enterprise" in product.name.lower():
                                plan_id = "enterprise"  # Override with enterprise
                                logger.info(f"✅ Setting plan to ENTERPRISE based on product name: {product.name}")
                        except Exception as e:
                            logger.warning(f"Could not retrieve product info: {str(e)}")
                    else:
                        logger.error(f"No price found in subscription: {subscription_id}")
                        price_id = None
                    
                    # Check if user is in Enterprise whitelist
                    customer_email = None
                    try:
                        customer = stripe.Customer.retrieve(customer_id)
                        customer_email = customer.email
                        logger.info(f"👤 Customer email: {customer_email}")
                        
                        if customer_email in ENTERPRISE_USERS:
                            plan_id = "enterprise"  # Override with enterprise for whitelisted users
                            logger.info(f"✅ Setting plan to ENTERPRISE based on whitelist: {customer_email}")
                    except Exception as e:
                        logger.warning(f"Could not retrieve customer email: {str(e)}")
                    
                    # FINAL DETERMINATION LOG
                    logger.info(f"🔒 FINAL PLAN DETERMINATION: {plan_id}")
                    
                    # CRITICAL: Last chance check for Enterprise plan
                    # If this is from a checkout session with ENTERPRISE in the metadata, 
                    # force the plan to be enterprise regardless of anything else
                    if intended_plan_id == "enterprise" and plan_id != "enterprise":
                        logger.warning(f"⚠️ CRITICAL: Intended plan is enterprise but detected as {plan_id}. FORCING ENTERPRISE.")
                        plan_id = "enterprise"
                        
                        # Force Enterprise plan using the dedicated handler
                        try:
                            # Also call force_upgrade_to_enterprise to ensure all systems are updated
                            force_result = await PaymentHandler.force_upgrade_to_enterprise(
                                user_id=user_id,
                                customer_id=customer_id,
                                subscription_id=subscription_id,
                                customer_email=customer_email
                            )
                            logger.info(f"✅ FINAL CHECK Force upgrade result: {force_result}")
                        except Exception as e:
                            logger.error(f"❌ Error in final enterprise force upgrade: {str(e)}")
                    
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
                    
                    # IMPORTANT: Use multiple update methods to ensure the change is applied
                    
                    # Method 1: CRITICAL: Try direct SQL update first for guaranteed update
                    try:
                        from supabase import create_client
                        SUPABASE_URL = os.getenv("SUPABASE_URL")
                        SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                        
                        if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                            logger.info(f"🔧 Attempting direct SQL update for user {user_id} to {plan_id}")
                            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                            
                            # Update user record directly via SQL - most reliable method
                            update_data = {
                                "subscription_tier": plan_id,
                                "subscription_status": status,
                                "stripe_customer_id": customer_id,
                                "stripe_subscription_id": subscription_id,
                                "subscription_current_period_end": datetime.fromtimestamp(current_period_end).isoformat(),
                                "updated_at": datetime.now().isoformat()
                            }
                            
                            update_response = supabase.table("users").update(update_data).eq("id", user_id).execute()
                            
                            if update_response.data and len(update_response.data) > 0:
                                logger.info(f"✅ Direct SQL update successful for user {user_id} to {plan_id}")
                                
                                # Also update subscription record
                                subscription_table_data = {
                                    "user_id": user_id,
                                    "plan": plan_id,
                                    "status": status,
                                    "current_period_end": datetime.fromtimestamp(current_period_end),
                                    "stripe_customer_id": customer_id,
                                    "stripe_subscription_id": subscription_id,
                                    "email": customer_email,
                                    "updated_at": datetime.now().isoformat()
                                }
                                
                                # Check if subscription record exists
                                sub_response = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()
                                
                                if sub_response.data and len(sub_response.data) > 0:
                                    # Update existing subscription
                                    supabase.table("subscriptions").update(subscription_table_data).eq("user_id", user_id).execute()
                                    logger.info(f"Updated existing subscription record for user {user_id}")
                                else:
                                    # Insert new subscription
                                    supabase.table("subscriptions").insert(subscription_table_data).execute()
                                    logger.info(f"Created new subscription record for user {user_id}")
                                
                                # Also update user auth metadata
                                try:
                                    auth_update = supabase.auth.admin.update_user_by_id(
                                        user_id,
                                        user_metadata={
                                            "subscription_tier": plan_id,
                                            "subscription_status": status
                                        }
                                    )
                                    logger.info(f"Updated user auth metadata for {user_id}")
                                except Exception as e:
                                    logger.warning(f"Could not update auth metadata: {str(e)}")
                            else:
                                logger.error(f"❌ Direct SQL update failed for user {user_id}")
                        else:
                            logger.warning("Supabase credentials not available for direct update")
                    except Exception as e:
                        logger.error(f"Error in direct SQL update: {str(e)}")
                    
                    # Method 2: Force an immediate upgrade for Enterprise plans through a separate process
                    # This ensures the user gets Enterprise even if the database update somehow fails
                    if plan_id == "enterprise":
                        logger.info(f"🔒 Enterprise plan confirmed - ensuring Enterprise tier is applied")
                        force_result = await PaymentHandler.force_upgrade_to_enterprise(
                            user_id=user_id,
                            customer_id=customer_id,
                            subscription_id=subscription_id,
                            customer_email=customer_email
                        )
                        logger.info(f"Force upgrade result at checkout: {force_result}")
                    
                    # Method 3: Regular database update as backup
                    logger.info(f"Updating user record with subscription data: {subscription_data}")
                    from backend.database import DatabaseHandler
                    updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                    
                    if updated_user:
                        logger.info(f"Successfully updated user record: {user_id}")
                        
                        # Also update subscription record for consistency
                        subscription_result = await DatabaseHandler.upsert_subscription(
                            user_id=user_id,
                            stripe_customer_id=customer_id,
                            stripe_subscription_id=subscription_id,
                            plan=plan_id,
                            status=status,
                            current_period_end=datetime.fromtimestamp(current_period_end),
                            email=customer_email,
                            billing_cycle=session.metadata.get("billing_cycle", "monthly")
                        )
                        
                        if subscription_result:
                            logger.info(f"Successfully updated subscription record for user: {user_id}")
                        else:
                            logger.error(f"Failed to update subscription record for user: {user_id}")
                        
                        # Verify that the update was applied
                        try:
                            verify_user = await DatabaseHandler.get_user(user_id)
                            if verify_user:
                                verified_tier = verify_user.get('subscription_tier', 'unknown')
                                logger.info(f"✅ Verification: User {user_id} subscription tier is now: {verified_tier}")
                                
                                # Double check if the tier should be enterprise but it's not
                                if plan_id == "enterprise" and verified_tier != "enterprise":
                                    logger.error(f"🚨 Verification failed! Plan should be enterprise but is {verified_tier}")
                                    # Last resort attempt - try another direct SQL update
                                    try:
                                        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                                        final_update = supabase.table("users").update({
                                            "subscription_tier": "enterprise",
                                            "updated_at": datetime.now().isoformat()
                                        }).eq("id", user_id).execute()
                                        logger.info(f"Emergency fix applied for user {user_id}")
                                    except Exception as e:
                                        logger.error(f"Emergency fix failed: {str(e)}")
                            else:
                                logger.error(f"Verification failed: Could not find user {user_id}")
                        except Exception as e:
                            logger.error(f"Error verifying user update: {str(e)}")
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
                    "message": f"Checkout completed for user {user_id} with plan {plan_id}",
                    "user_id": user_id,
                    "plan_id": plan_id
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
                        product_id = subscription.items.data[0].price.product
                        try:
                            product = stripe.Product.retrieve(product_id)
                            logger.info(f"Product name: {product.name}, Product ID: {product_id}")
                            
                            # If product name contains enterprise, use enterprise plan
                            if product.name and "enterprise" in product.name.lower():
                                logger.info(f"Product name indicates Enterprise plan: {product.name}")
                                plan_id = "enterprise"
                                logger.info(f"✅ Setting plan to ENTERPRISE based on product name")
                        except Exception as e:
                            logger.warning(f"Could not retrieve product info: {str(e)}")
                        
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
                    billing_cycle=session.metadata.get("billing_cycle", "monthly")
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
                        product_id = subscription.items.data[0].price.product
                        try:
                            product = stripe.Product.retrieve(product_id)
                            logger.info(f"Product name: {product.name}, Product ID: {product_id}")
                            
                            # If product name contains enterprise, use enterprise plan
                            if product.name and "enterprise" in product.name.lower():
                                logger.info(f"Product name indicates Enterprise plan: {product.name}")
                                plan_id = "enterprise"
                        except Exception as e:
                            logger.warning(f"Could not retrieve product info: {str(e)}")
                        
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
                        billing_cycle=session.metadata.get("billing_cycle", "monthly")
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
                        billing_cycle=session.metadata.get("billing_cycle", "monthly")
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
                            product_id = subscription.items.data[0].price.product
                            try:
                                product = stripe.Product.retrieve(product_id)
                                logger.info(f"Product name: {product.name}, Product ID: {product_id}")
                                
                                # If product name contains enterprise, use enterprise plan
                                if product.name and "enterprise" in product.name.lower():
                                    logger.info(f"Product name indicates Enterprise plan: {product.name}")
                                    plan_id = "enterprise"
                            except Exception as e:
                                logger.warning(f"Could not retrieve product info: {str(e)}")
                            
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
                    
                    # Upsert the subscription record
                    subscription_result = await DatabaseHandler.upsert_subscription(
                        user_id=user_id,
                        stripe_customer_id=customer_id,
                        stripe_subscription_id=subscription_id,
                        plan=plan_id,
                        status=status,
                        current_period_end=datetime.fromtimestamp(current_period_end),
                        email=customer_email,
                        billing_cycle=session.metadata.get("billing_cycle", "monthly")
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
                            product_id = subscription.items.data[0].price.product
                            try:
                                product = stripe.Product.retrieve(product_id)
                                logger.info(f"Product name: {product.name}, Product ID: {product_id}")
                                
                                # If product name contains enterprise, use enterprise plan
                                if product.name and "enterprise" in product.name.lower():
                                    logger.info(f"Product name indicates Enterprise plan: {product.name}")
                                    plan_id = "enterprise"
                            except Exception as e:
                                logger.warning(f"Could not retrieve product info: {str(e)}")
                            
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
                    
                    # Upsert the subscription record
                    subscription_result = await DatabaseHandler.upsert_subscription(
                        user_id=user_id,
                        stripe_customer_id=customer_id,
                        stripe_subscription_id=subscription_id,
                        plan=plan_id,
                        status=status,
                        current_period_end=datetime.fromtimestamp(current_period_end),
                        email=customer_email,
                        billing_cycle=session.metadata.get("billing_cycle", "monthly")
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
    async def force_upgrade_to_enterprise(
        user_id: str,
        customer_id: str = None,
        subscription_id: str = None,
        customer_email: str = None
    ) -> Dict[str, Any]:
        """
        Force upgrade a user to Enterprise tier if their payment indicates they should be
        on Enterprise but the automatic processes failed.
        
        Args:
            user_id: The user's ID
            customer_id: The Stripe customer ID (optional)
            subscription_id: The Stripe subscription ID (optional)
            customer_email: The customer's email (optional)
            
        Returns:
            Dict[str, Any]: Result of the operation
        """
        try:
            from backend.database import DatabaseHandler
            
            # Get the user's current subscription tier
            user = await DatabaseHandler.get_user(user_id)
            current_tier = "unknown"
            user_email = None
            
            if user:
                current_tier = user.get("subscription_tier", "free")
                user_email = user.get("email")
                logger.info(f"User found: {user_id}, current tier: {current_tier}, email: {user_email}")
            else:
                logger.error(f"Force upgrade failed: User {user_id} not found")
                # Try to find user by email if provided
                if customer_email:
                    logger.info(f"Trying to find user by email: {customer_email}")
                    user_by_email = await DatabaseHandler.get_user_by_email(customer_email)
                    if user_by_email:
                        user_id = user_by_email.get("id")
                        user = user_by_email
                        user_email = customer_email
                        current_tier = user.get("subscription_tier", "free")
                        logger.info(f"Found user by email: {user_id}, current tier: {current_tier}")
                    else:
                        logger.error(f"User not found by email either: {customer_email}")
                        return {
                            "status": "error",
                            "message": f"User not found by ID or email"
                        }
                else:
                    return {
                        "status": "error",
                        "message": f"User {user_id} not found"
                    }
                    
            # Set a standard end date for the Enterprise subscription (1 year from now)
            current_period_end = datetime.now() + timedelta(days=365)
            
            # Log the upgrade attempt
            logger.info(f"⚡ Force upgrading user {user_id} from {current_tier} to Enterprise")
            
            # CRITICAL: Extra logging for enterprise upgrades
            logger.info(f"ENTERPRISE UPGRADE - User ID: {user_id}")
            logger.info(f"ENTERPRISE UPGRADE - Customer Email: {customer_email or user_email}")
            logger.info(f"ENTERPRISE UPGRADE - Current Tier: {current_tier}")
            
            # Flag to track if any update was successful
            sql_update_success = False
            db_update_success = False
            metadata_update_success = False
            
            # Try direct SQL approach first for guaranteed success
            try:
                # Only do this if we have Supabase client available
                from supabase import create_client
                SUPABASE_URL = os.getenv("SUPABASE_URL")
                SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                
                if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                    
                    # Execute raw SQL to update user to enterprise tier
                    logger.info(f"🔄 Force upgrading user {user_id} via direct SQL")
                    
                    update_query = f"""
                    UPDATE users
                    SET subscription_tier = 'enterprise',
                        subscription_status = 'active',
                        updated_at = NOW()
                    WHERE id = '{user_id}'
                    RETURNING *;
                    """
                    
                    update_response = supabase.rpc('execute_sql', {'query': update_query}).execute()
                    
                    if update_response.data and len(update_response.data) > 0:
                        logger.info(f"✅ Direct SQL update successful for user {user_id} to Enterprise plan")
                        sql_update_success = True
                        
                        # Also update subscription record
                        subscription_data = {
                            "user_id": user_id,
                            "plan": "enterprise",
                            "status": "active",
                            "updated_at": datetime.now().isoformat(),
                            "current_period_end": current_period_end.isoformat()
                        }
                        
                        if customer_id:
                            subscription_data["stripe_customer_id"] = customer_id
                        if subscription_id:
                            subscription_data["stripe_subscription_id"] = subscription_id
                        if customer_email or user_email:
                            subscription_data["email"] = customer_email or user_email
                        
                        # Try to create or update subscription record
                        try:
                            subscription_response = await DatabaseHandler.upsert_subscription(
                                user_id=user_id,
                                stripe_customer_id=customer_id or "force_upgrade",
                                stripe_subscription_id=subscription_id or "force_upgrade",
                                plan="enterprise",
                                status="active",
                                current_period_end=current_period_end,
                                email=customer_email or user_email or "unknown"
                            )
                            logger.info(f"✅ Subscription record updated via SQL approach")
                        except Exception as e:
                            logger.error(f"Failed to update subscription record via SQL approach: {str(e)}")
                    else:
                        logger.error(f"❌ Direct SQL update failed for user {user_id}")
            except Exception as e:
                logger.error(f"❌ Error with direct SQL update: {str(e)}")
            
            # If SQL update wasn't successful, try regular database update
            if not sql_update_success:
                # Update the user's subscription tier to enterprise
                subscription_data = {
                    "subscription_tier": "enterprise",
                    "subscription_status": "active",
                    "updated_at": datetime.now().isoformat()
                }
                
                # Add optional fields if provided
                if customer_id:
                    subscription_data["stripe_customer_id"] = customer_id
                if subscription_id:
                    subscription_data["stripe_subscription_id"] = subscription_id
                if current_period_end:
                    subscription_data["subscription_current_period_end"] = current_period_end.isoformat()
                    
                # Update user record
                logger.info(f"🔄 Force upgrading user {user_id} from {current_tier} to Enterprise tier via DatabaseHandler")
                updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                
                if updated_user:
                    logger.info(f"✅ Successfully force upgraded user {user_id} to Enterprise tier via DatabaseHandler")
                    db_update_success = True
                    
                    # Also update the subscription record to ensure consistency
                    try:
                        subscription_result = await DatabaseHandler.upsert_subscription(
                            user_id=user_id,
                            stripe_customer_id=customer_id or "force_upgrade",
                            stripe_subscription_id=subscription_id or "force_upgrade",
                            plan="enterprise",
                            status="active",
                            current_period_end=current_period_end,
                            email=customer_email or user_email or "unknown"
                        )
                        
                        logger.info(f"✅ Updated subscription record for newly-upgraded Enterprise user")
                    except Exception as e:
                        logger.warning(f"Failed to update subscription record, but user was upgraded: {str(e)}")
                else:
                    logger.error(f"❌ Failed to force upgrade user {user_id} to Enterprise tier via DatabaseHandler")
            
            # Method 3: Update user's auth metadata 
            metadata_update_success = False
            
            try:
                from supabase import create_client
                SUPABASE_URL = os.getenv("SUPABASE_URL")
                SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                
                if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                    logger.info(f"🔄 Updating user auth metadata for user {user_id}")
                    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                    
                    # Update auth metadata
                    auth_update = supabase.auth.admin.update_user_by_id(
                        user_id,
                        user_metadata={
                            "subscription_tier": "enterprise",
                            "subscription_status": "active",
                            "subscription_current_period_end": current_period_end.isoformat()
                        }
                    )
                    
                    if auth_update.user:
                        logger.info(f"✅ Successfully updated auth metadata to Enterprise for user {user_id}")
                        metadata_update_success = True
                    else:
                        logger.error(f"❌ Failed to update auth metadata for user {user_id}")
            except Exception as e:
                logger.error(f"❌ Error updating auth metadata: {str(e)}")
            
            # Determine the overall status of the upgrade operation
            if sql_update_success or db_update_success:
                logger.info(f"🎉 User {user_id} successfully upgraded to Enterprise tier")
                return {
                    "status": "success",
                    "message": f"Successfully upgraded user {user_id} to Enterprise tier",
                    "details": {
                        "sql_update": sql_update_success,
                        "db_update": db_update_success,
                        "metadata_update": metadata_update_success
                    }
                }
            else:
                logger.error(f"❌ All upgrade methods failed for user {user_id}")
                return {
                    "status": "error",
                    "message": f"Failed to upgrade user {user_id} to Enterprise tier",
                    "details": {
                        "sql_update": sql_update_success,
                        "db_update": db_update_success,
                        "metadata_update": metadata_update_success
                    }
                }
                
        except Exception as e:
            logger.error(f"❌ Error in force_upgrade_to_enterprise: {str(e)}")
            return {
                "status": "error",
                "message": f"Error in force upgrade: {str(e)}"
            }
    
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
            
            # If already on target plan, just confirm status
            if current_tier == target_plan:
                logger.info(f"User {user_id} is already on {target_plan} tier - confirming status")
                
                # Update timestamp anyway to confirm the subscription
                subscription_data = {
                    "updated_at": datetime.now().isoformat()
                }
                
                # Update user record
                await DatabaseHandler.update_user(user_id, subscription_data)
                
                # Update subscription record
                current_period_end = datetime.now() + timedelta(days=365)  # Set to 1 year from now
                
                subscription_result = await DatabaseHandler.upsert_subscription(
                    user_id=user_id,
                    stripe_customer_id="manual_fix",
                    stripe_subscription_id="manual_fix",
                    plan=target_plan,
                    status="active",
                    current_period_end=current_period_end,
                    email=email
                )
                
                logger.info(f"Updated subscription record for already-{target_plan} user: {subscription_result}")
                
                return {
                    "status": "success",
                    "message": f"User already on {target_plan} tier, confirmed status"
                }
                
            # Update the user's subscription tier
            subscription_data = {
                "subscription_tier": target_plan,
                "subscription_status": "active",
                "updated_at": datetime.now().isoformat()
            }
                
            # Update user record
            logger.info(f"🔄 Manually upgrading user {user_id} from {current_tier} to {target_plan} tier")
            updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
            
            if updated_user:
                logger.info(f"✅ Successfully fixed user {user_id} to {target_plan} tier")
                
                # Also update subscription record for consistency
                try:
                    # Set subscription end date to 1 year from now for manual fixes
                    current_period_end = datetime.now() + timedelta(days=365)
                        
                    # Update subscription record
                    subscription_result = await DatabaseHandler.upsert_subscription(
                        user_id=user_id,
                        stripe_customer_id="manual_fix",
                        stripe_subscription_id="manual_fix",
                        plan=target_plan,
                        status="active",
                        current_period_end=current_period_end,
                        email=email
                    )
                    
                    logger.info(f"Created/updated subscription record for manually fixed user: {subscription_result}")
                except Exception as e:
                    logger.warning(f"Failed to update subscription record, but user was upgraded: {str(e)}")
                
                # Also try to update user's auth metadata
                try:
                    from supabase import create_client
                    SUPABASE_URL = os.getenv("SUPABASE_URL")
                    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
                    
                    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                        
                        # Update user metadata to include subscription info
                        try:
                            auth_response = supabase.auth.admin.update_user_by_id(
                                user_id,
                                user_metadata={
                                    "subscription_tier": target_plan,
                                    "subscription_status": "active"
                                }
                            )
                            logger.info(f"Successfully updated user auth metadata for {user_id}")
                        except Exception as e:
                            logger.warning(f"Failed to update user auth metadata, but database was updated: {str(e)}")
                except Exception as e:
                    logger.warning(f"Failed to initialize Supabase client: {str(e)}")
                
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