# Stripe Setup Guide for Upscalor

This guide will help you set up Stripe for handling payments in the Upscalor SaaS application.

## 1. Create a Stripe Account

1. Go to [Stripe's website](https://stripe.com) and sign up for an account if you don't have one already.
2. Complete the onboarding process to activate your account.

## 2. Get API Keys

1. In the Stripe Dashboard, go to **Developers > API keys**.
2. You'll see two keys:
   - **Publishable key**: This is used in the frontend to initialize Stripe.js.
   - **Secret key**: This is used in the backend to interact with the Stripe API.
3. Copy these keys and add them to your environment variables:
   - Add the secret key to `backend/.env` as `STRIPE_API_KEY`.
   - Add the publishable key to `frontend/.env` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## 3. Create Products and Prices

1. In the Stripe Dashboard, go to **Products**.
2. Create a new product for the Pro subscription:
   - **Name**: Upscalor Pro
   - **Description**: Pro subscription for Upscalor with advanced features
   - **Pricing**: $19/month (recurring)
3. After creating the product, you'll get a **Price ID**. Copy this ID and add it to your `backend/.env` as `STRIPE_PRO_PLAN_ID`.

## 4. Set Up Usage-Based Pricing for API

1. In the Stripe Dashboard, go to **Products**.
2. Create a new product for API usage:
   - **Name**: Upscalor API
   - **Description**: Pay-as-you-go API access for Upscalor
   - **Pricing**: $0.003 per image processed (usage-based)
3. After creating the product, you'll get a **Price ID**. Copy this ID and add it to your `backend/.env` as `STRIPE_API_USAGE_PRICE_ID`.

## 5. Configure Webhook

1. In the Stripe Dashboard, go to **Developers > Webhooks**.
2. Click **Add endpoint**.
3. Enter your webhook URL (e.g., `https://your-backend-url.com/webhook/stripe`).
4. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. After creating the webhook, you'll get a **Webhook Secret**. Copy this secret and add it to your `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

## 6. Test the Integration

1. Use Stripe's test mode to test the integration without making real charges.
2. Use Stripe's test card numbers for testing:
   - `4242 4242 4242 4242` - Successful payment
   - `4000 0000 0000 0002` - Declined payment
3. Check the Stripe Dashboard to verify that test events are being received correctly.

## 7. Go Live

1. Once you've tested the integration and everything is working correctly, you can switch to live mode.
2. Update your environment variables with the live API keys.
3. Make sure your webhook URL is updated to point to your production backend.

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe.js Documentation](https://stripe.com/docs/js)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Billing Documentation](https://stripe.com/docs/billing) 