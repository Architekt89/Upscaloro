from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import stripe
from fastapi import HTTPException, status
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Get Stripe API key from environment variables
stripe_api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe_api_key:
    logger.warning("STRIPE_SECRET_KEY environment variable is not set!")
else:
    logger.info(f"Stripe API key configured for billing.py (ending in: {stripe_api_key[-4:] if stripe_api_key else 'None'})")
    stripe.api_key = stripe_api_key

# Models for billing data
class SubscriptionPlan(BaseModel):
    id: str
    name: str
    price: float
    interval: str  # 'month' or 'year'
    features: List[str]
    limits: Dict[str, int]

class PaymentMethod(BaseModel):
    id: str
    type: str
    brand: str
    last4: str
    exp_month: int
    exp_year: int
    is_default: bool

class Invoice(BaseModel):
    id: str
    date: str
    amount: float
    status: str
    description: str
    download_url: str

class UsageStats(BaseModel):
    images_processed: int
    images_limit: int
    api_calls: int
    api_calls_limit: int
    storage_used: str
    storage_limit: str

class BillingInfo(BaseModel):
    subscription: Optional[Dict[str, Any]] = None
    payment_methods: List[Dict[str, Any]] = []
    invoices: List[Dict[str, Any]] = []
    usage: Optional[Dict[str, Any]] = None

# Available subscription plans
SUBSCRIPTION_PLANS = {
    "free": SubscriptionPlan(
        id="free",
        name="Free",
        price=0.0,
        interval="month",
        features=[
            "Up to 3 images per month",
            "2x and 4x upscaling",
            "Basic upscaling mode",
            "Standard support"
        ],
        limits={
            "images_per_month": 3,
            "max_scale_factor": 4,
            "api_calls_per_month": 0,
            "storage_gb": 0.1
        }
    ),
    "pro": SubscriptionPlan(
        id="pro",
        name="Pro",
        price=15.0,
        interval="month",
        features=[
            "Unlimited images",
            "Up to 16x upscaling",
            "All upscaling modes",
            "API access",
            "Priority support"
        ],
        limits={
            "images_per_month": 100,
            "max_scale_factor": 16,
            "api_calls_per_month": 500,
            "storage_gb": 5
        }
    ),
    "enterprise": SubscriptionPlan(
        id="enterprise",
        name="Enterprise",
        price=30.0,
        interval="month",
        features=[
            "Unlimited images",
            "Up to 16x upscaling",
            "All upscaling modes",
            "Unlimited API access",
            "Dedicated support",
            "Custom integration"
        ],
        limits={
            "images_per_month": 1000,
            "max_scale_factor": 16,
            "api_calls_per_month": 5000,
            "storage_gb": 20
        }
    )
}

class BillingHandler:
    @staticmethod
    async def get_user_billing_info(user_id: str) -> BillingInfo:
        """
        Get billing information for a user, including subscription, payment methods, and invoices.
        In a real implementation, this would fetch data from Stripe and your database.
        """
        try:
            # This is a mock implementation
            # In a real app, you would fetch this data from Stripe and your database
            
            # In a real implementation, you would check if the user exists
            # and has billing information in the database
            # For now, we'll always return mock data
            
            # Mock subscription data
            subscription = {
                "plan": "Pro",
                "status": "active",
                "renewal_date": (datetime.now().replace(day=1).strftime("%Y-%m-%d")),
                "price": "$15.00",  # Updated to match README
                "billing_cycle": "monthly",
                "features": [
                    "Unlimited images",
                    "Up to 16x upscaling",
                    "All upscaling modes",
                    "API access",
                    "Priority support",
                ]
            }
            
            # Mock payment methods
            payment_methods = [
                {
                    "id": "pm_1",
                    "type": "card",
                    "brand": "visa",
                    "last4": "4242",
                    "exp_month": 12,
                    "exp_year": 2024,
                    "is_default": True,
                }
            ]
            
            # Mock invoices
            invoices = [
                {
                    "id": "in_1",
                    "date": (datetime.now().replace(day=1).strftime("%Y-%m-%d")),
                    "amount": "$15.00",  # Updated to match README
                    "status": "paid",
                    "description": "Pro Plan - Monthly",
                    "download_url": "#",
                },
                {
                    "id": "in_2",
                    "date": (datetime.now().replace(month=datetime.now().month-1, day=1).strftime("%Y-%m-%d")),
                    "amount": "$15.00",  # Updated to match README
                    "status": "paid",
                    "description": "Pro Plan - Monthly",
                    "download_url": "#",
                },
                {
                    "id": "in_3",
                    "date": (datetime.now().replace(month=datetime.now().month-2, day=1).strftime("%Y-%m-%d")),
                    "amount": "$15.00",  # Updated to match README
                    "status": "paid",
                    "description": "Pro Plan - Monthly",
                    "download_url": "#",
                },
            ]
            
            # Mock usage data
            usage = {
                "images_processed": 87,
                "images_limit": 100,
                "api_calls": 230,
                "api_calls_limit": 500,
                "storage_used": "1.2 GB",
                "storage_limit": "5 GB",
            }
            
            return BillingInfo(
                subscription=subscription,
                payment_methods=payment_methods,
                invoices=invoices,
                usage=usage
            )
            
        except Exception as e:
            # Instead of raising an exception, return default billing info
            logger.error(f"Error fetching billing information: {str(e)}")
            
            # Default subscription for new users
            default_subscription = {
                "plan": "Free",
                "status": "active",
                "renewal_date": (datetime.now().replace(day=1).strftime("%Y-%m-%d")),
                "price": "$0.00",
                "billing_cycle": "monthly",
                "features": [
                    "Up to 3 images per month",
                    "2x and 4x upscaling",
                    "Basic upscaling mode",
                    "Standard support"
                ]
            }
            
            # Default usage for new users
            default_usage = {
                "images_processed": 0,
                "images_limit": 3,
                "api_calls": 0,
                "api_calls_limit": 0,
                "storage_used": "0 GB",
                "storage_limit": "0.1 GB",
            }
            
            return BillingInfo(
                subscription=default_subscription,
                payment_methods=[],
                invoices=[],
                usage=default_usage
            )
    
    @staticmethod
    async def update_subscription(user_id: str, plan_id: str) -> Dict[str, Any]:
        """
        Update a user's subscription plan.
        In a real implementation, this would update the subscription in Stripe.
        """
        try:
            # Check if the plan exists
            if plan_id not in SUBSCRIPTION_PLANS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid plan ID: {plan_id}"
                )
            
            # This is a mock implementation
            # In a real app, you would update the subscription in Stripe and your database
            
            plan = SUBSCRIPTION_PLANS[plan_id]
            
            return {
                "success": True,
                "message": f"Subscription updated to {plan.name} plan",
                "plan": {
                    "id": plan.id,
                    "name": plan.name,
                    "price": plan.price,
                    "interval": plan.interval,
                    "features": plan.features,
                    "limits": plan.limits
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating subscription: {str(e)}"
            )
    
    @staticmethod
    async def cancel_subscription(user_id: str) -> Dict[str, Any]:
        """
        Cancel a user's subscription.
        In a real implementation, this would cancel the subscription in Stripe.
        """
        try:
            # This is a mock implementation
            # In a real app, you would cancel the subscription in Stripe and your database
            
            return {
                "success": True,
                "message": "Subscription cancelled successfully. You will have access until the end of your billing period."
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error cancelling subscription: {str(e)}"
            )
    
    @staticmethod
    async def add_payment_method(user_id: str, payment_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new payment method for a user.
        In a real implementation, this would add the payment method in Stripe.
        """
        try:
            # This is a mock implementation
            # In a real app, you would add the payment method in Stripe and your database
            
            return {
                "success": True,
                "message": "Payment method added successfully",
                "payment_method": {
                    "id": "pm_new",
                    "type": "card",
                    "brand": payment_details.get("brand", "visa"),
                    "last4": payment_details.get("last4", "4242"),
                    "exp_month": payment_details.get("exp_month", 12),
                    "exp_year": payment_details.get("exp_year", 2025),
                    "is_default": payment_details.get("is_default", False)
                }
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error adding payment method: {str(e)}"
            )
    
    @staticmethod
    async def delete_payment_method(user_id: str, payment_method_id: str) -> Dict[str, Any]:
        """
        Delete a payment method for a user.
        In a real implementation, this would delete the payment method in Stripe.
        """
        try:
            # This is a mock implementation
            # In a real app, you would delete the payment method in Stripe and your database
            
            return {
                "success": True,
                "message": "Payment method deleted successfully"
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting payment method: {str(e)}"
            )
    
    @staticmethod
    async def set_default_payment_method(user_id: str, payment_method_id: str) -> Dict[str, Any]:
        """
        Set a payment method as the default for a user.
        In a real implementation, this would update the default payment method in Stripe.
        """
        try:
            # This is a mock implementation
            # In a real app, you would update the default payment method in Stripe and your database
            
            return {
                "success": True,
                "message": "Default payment method updated successfully"
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error setting default payment method: {str(e)}"
            )
    
    @staticmethod
    async def get_available_plans() -> Dict[str, Any]:
        """
        Get all available subscription plans.
        """
        try:
            plans = {}
            for plan_id, plan in SUBSCRIPTION_PLANS.items():
                plans[plan_id] = {
                    "id": plan.id,
                    "name": plan.name,
                    "price": plan.price,
                    "interval": plan.interval,
                    "features": plan.features,
                    "limits": plan.limits
                }
            
            return {
                "plans": plans
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching subscription plans: {str(e)}"
            ) 