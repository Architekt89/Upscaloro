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
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
logger.info(f"Stripe API configured with key ending in: {stripe.api_key[-4:] if stripe.api_key else 'None'}")

# Subscription plan IDs - These should be created in Stripe dashboard
SUBSCRIPTION_PLANS = {
    "basic": os.getenv("STRIPE_BASIC_PLAN_ID", "price_basic"),
    "pro": os.getenv("STRIPE_PRO_PLAN_ID", "price_pro"),
    "enterprise": os.getenv("STRIPE_ENTERPRISE_PLAN_ID", "price_enterprise"),
}

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
        Creates a Stripe checkout session for subscription.
        
        Args:
            user_id: The user ID
            plan_id: The subscription plan ID
            success_url: The URL to redirect to on successful payment
            cancel_url: The URL to redirect to on cancelled payment
            
        Returns:
            Dict[str, Any]: The checkout session details
        """
        try:
            logger.info(f"Creating checkout session for user {user_id} with plan {plan_id}")
            
            # Get the Stripe price ID for the selected plan
            price_id = SUBSCRIPTION_PLANS.get(plan_id)
            if not price_id:
                logger.error(f"Invalid plan ID: {plan_id}")
                raise ValueError(f"Invalid plan ID: {plan_id}")
                
            # Create a checkout session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": price_id,
                        "quantity": 1,
                    },
                ],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "user_id": user_id,
                },
            )
            
            logger.info(f"Checkout session created with ID: {checkout_session.id}")
            return {
                "session_id": checkout_session.id,
                "url": checkout_session.url,
            }
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            raise
    
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
                
            logger.info("Constructing Stripe event from webhook payload")
            
            # Verify the webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
            
            logger.info(f"Received Stripe webhook event: {event.type}")
            
            # Handle the event based on its type
            if event.type == "checkout.session.completed":
                session = event.data.object
                user_id = session.metadata.get("user_id")
                logger.info(f"Checkout session completed for user: {user_id}")
                
                # TODO: Update user subscription in database
                # This would connect to your user database and update the subscription status
                
                return {
                    "status": "success",
                    "message": f"Subscription created for user {user_id}",
                }
            elif event.type == "customer.subscription.created":
                subscription = event.data.object
                customer_id = subscription.customer
                logger.info(f"Subscription created for customer: {customer_id}")
                
                # TODO: Update user subscription in database
                
                return {
                    "status": "success",
                    "message": f"Subscription created for customer {customer_id}",
                }
            elif event.type == "customer.subscription.updated":
                subscription = event.data.object
                customer_id = subscription.customer
                logger.info(f"Subscription updated for customer: {customer_id}")
                
                # TODO: Update user subscription in database
                
                return {
                    "status": "success",
                    "message": f"Subscription updated for customer {customer_id}",
                }
            elif event.type == "customer.subscription.deleted":
                subscription = event.data.object
                customer_id = subscription.customer
                logger.info(f"Subscription deleted for customer: {customer_id}")
                
                # TODO: Update user subscription in database
                
                return {
                    "status": "success",
                    "message": f"Subscription deleted for customer {customer_id}",
                }
            elif event.type == "invoice.paid":
                invoice = event.data.object
                customer_id = invoice.customer
                logger.info(f"Invoice paid for customer: {customer_id}")
                
                # TODO: Update user billing history in database
                
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
            else:
                logger.info(f"Unhandled event type: {event.type}")
                return {
                    "status": "ignored",
                    "message": f"Unhandled event type: {event.type}",
                }
        except ValueError as e:
            # Invalid payload or signature
            logger.error(f"Invalid webhook payload or signature: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error handling webhook: {str(e)}")
            raise
    
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