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

# Log available plans
logger.info(f"Available Stripe subscription plans: {SUBSCRIPTION_PLANS}")

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
                logger.error(f"Invalid plan ID: {plan_id}. Available plans: {SUBSCRIPTION_PLANS}")
                raise ValueError(f"Invalid plan ID: {plan_id}")
            
            logger.info(f"Using Stripe price ID: {price_id} for plan: {plan_id}")
                
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
                    "plan_id": plan_id,
                    "billing_cycle": "monthly"
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
                user_id = session.metadata.get("user_id")
                logger.info(f"Checkout session completed for user: {user_id}")
                
                # Extract necessary data from the session
                customer_id = session.customer
                subscription_id = session.subscription
                plan_id = session.metadata.get("plan_id")
                billing_cycle = session.metadata.get("billing_cycle", "monthly")
                
                if not user_id or not subscription_id or not plan_id:
                    logger.error(f"Missing required data in checkout session: user_id={user_id}, subscription_id={subscription_id}, plan_id={plan_id}")
                    return {
                        "status": "error",
                        "message": "Missing required data in checkout session"
                    }
                
                # Retrieve the subscription details from Stripe
                try:
                    subscription = stripe.Subscription.retrieve(subscription_id)
                    current_period_end = subscription.current_period_end
                    status = subscription.status
                    
                    # Get the price ID from the subscription
                    if subscription.items and subscription.items.data:
                        price_id = subscription.items.data[0].price.id
                    else:
                        logger.error(f"No price found in subscription: {subscription_id}")
                        price_id = None
                    
                    logger.info(f"Retrieved subscription details: status={status}, price_id={price_id}, current_period_end={current_period_end}")
                except stripe.error.StripeError as e:
                    logger.error(f"Error retrieving subscription from Stripe: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Error retrieving subscription: {str(e)}"
                    }
                
                # Update the user's subscription in the database
                try:
                    # Get the user's email from Stripe customer
                    customer_email = None
                    try:
                        customer = stripe.Customer.retrieve(customer_id)
                        customer_email = customer.email
                    except Exception as e:
                        logger.warning(f"Could not retrieve customer email: {str(e)}")
                    
                    # Update the user record with subscription details
                    from backend.database import DatabaseHandler
                    
                    # First update the user's subscription tier
                    subscription_data = {
                        "subscription_tier": plan_id,
                        "stripe_customer_id": customer_id,
                        "stripe_subscription_id": subscription_id,
                        "subscription_status": status,
                        "subscription_price_id": price_id,
                        "subscription_current_period_end": datetime.fromtimestamp(current_period_end).isoformat(),
                        "subscription_billing_cycle": billing_cycle,
                        "updated_at": datetime.now().isoformat()
                    }
                    
                    updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                    
                    # Then upsert the subscription record
                    subscription_result = await DatabaseHandler.upsert_subscription(
                        user_id=user_id,
                        stripe_customer_id=customer_id,
                        stripe_subscription_id=subscription_id,
                        plan=plan_id,
                        status=status,
                        current_period_end=datetime.fromtimestamp(current_period_end),
                        email=customer_email
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
                    "message": f"Subscription created for user {user_id}",
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
                    for plan, plan_price_id in SUBSCRIPTION_PLANS.items():
                        if plan_price_id == price_id:
                            plan_id = plan
                            break
                    
                    if not plan_id:
                        logger.error(f"No matching plan found for price ID: {price_id}")
                else:
                    logger.error(f"No price found in subscription: {subscription_id}")
                    price_id = None
                    plan_id = None
                
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
                
                updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                
                # Then upsert the subscription record
                subscription_result = await DatabaseHandler.upsert_subscription(
                    user_id=user_id,
                    stripe_customer_id=customer_id,
                    stripe_subscription_id=subscription_id,
                    plan=plan_id or "pro",  # Default to pro if plan_id is not found
                    status=status,
                    current_period_end=datetime.fromtimestamp(current_period_end),
                    email=customer_email
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
                    for plan, plan_price_id in SUBSCRIPTION_PLANS.items():
                        if plan_price_id == price_id:
                            plan_id = plan
                            break
                    
                    if not plan_id:
                        logger.error(f"No matching plan found for price ID: {price_id}")
                else:
                    logger.error(f"No price found in subscription: {subscription_id}")
                    price_id = None
                    plan_id = None
                
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
                    
                    updated_user = await DatabaseHandler.update_user(user_id, subscription_data)
                    
                    # Then upsert the subscription record
                    subscription_result = await DatabaseHandler.upsert_subscription(
                        user_id=user_id,
                        stripe_customer_id=customer_id,
                        stripe_subscription_id=subscription_id,
                        plan=plan_id or "pro",  # Default to pro if plan_id is not found
                        status=status,
                        current_period_end=datetime.fromtimestamp(current_period_end),
                        email=customer_email
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
                        email=customer_email
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
                        for plan, plan_price_id in SUBSCRIPTION_PLANS.items():
                            if plan_price_id == price_id:
                                plan_id = plan
                                break
                        
                        if not plan_id:
                            logger.error(f"No matching plan found for price ID: {price_id}")
                            plan_id = "pro"  # Default to pro if no match found
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
                    except Exception as e:
                        logger.warning(f"Could not retrieve customer email: {str(e)}")
                    
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
                        email=customer_email
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
                        for plan, plan_price_id in SUBSCRIPTION_PLANS.items():
                            if plan_price_id == price_id:
                                plan_id = plan
                                break
                        
                        if not plan_id:
                            logger.error(f"No matching plan found for price ID: {price_id}")
                            plan_id = "pro"  # Default to pro if no match found
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
                    except Exception as e:
                        logger.warning(f"Could not retrieve customer email: {str(e)}")
                    
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
                        email=customer_email
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