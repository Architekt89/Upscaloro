# Billing API Documentation

This document provides information about the billing API endpoints available in the picluxe application.

## Authentication

All billing API endpoints require authentication. You must include a valid JWT token in the `Authorization` header of your requests:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Get Billing Information

Retrieves the user's billing information, including subscription details, payment methods, usage statistics, and billing history.

**URL**: `/billing`

**Method**: `GET`

**Auth required**: Yes

**Response**:

```json
{
  "subscription": {
    "plan": "Pro",
    "status": "active",
    "renewal_date": "2023-12-01",
    "price": "$15.00",
    "billing_cycle": "monthly",
    "features": [
      "Unlimited images",
      "Up to 16x upscaling",
      "All upscaling modes",
      "API access",
      "Priority support"
    ]
  },
  "payment_methods": [
    {
      "id": "pm_1",
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2024,
      "is_default": true
    }
  ],
  "invoices": [
    {
      "id": "in_1",
      "date": "2023-11-01",
      "amount": "$15.00",
      "status": "paid",
      "description": "Pro Plan - Monthly",
      "download_url": "#"
    }
  ],
  "usage": {
    "images_processed": 87,
    "images_limit": 100,
    "api_calls": 230,
    "api_calls_limit": 500,
    "storage_used": "1.2 GB",
    "storage_limit": "5 GB"
  }
}
```

### Update Subscription

Updates the user's subscription plan.

**URL**: `/billing/subscription`

**Method**: `POST`

**Auth required**: Yes

**Request Body**:

```json
{
  "plan_id": "pro"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Subscription updated to Pro plan",
  "plan": {
    "id": "pro",
    "name": "Pro",
    "price": 15.00,
    "interval": "month",
    "features": [
      "Unlimited images",
      "Up to 16x upscaling",
      "All upscaling modes",
      "API access",
      "Priority support"
    ],
    "limits": {
      "images_per_month": 100,
      "max_scale_factor": 16,
      "api_calls_per_month": 500,
      "storage_gb": 5
    }
  }
}
```

### Cancel Subscription

Cancels the user's subscription.

**URL**: `/billing/subscription/cancel`

**Method**: `POST`

**Auth required**: Yes

**Response**:

```json
{
  "success": true,
  "message": "Subscription cancelled successfully. You will have access until the end of your billing period."
}
```

### Add Payment Method

Adds a new payment method for the user.

**URL**: `/billing/payment-methods`

**Method**: `POST`

**Auth required**: Yes

**Request Body**:

```json
{
  "card_number": "4242424242424242",
  "exp_month": 12,
  "exp_year": 2024,
  "cvc": "123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Payment method added successfully",
  "payment_method": {
    "id": "pm_new",
    "type": "card",
    "brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2024,
    "is_default": false
  }
}
```

### Delete Payment Method

Deletes a payment method for the user.

**URL**: `/billing/payment-methods/{payment_method_id}`

**Method**: `DELETE`

**Auth required**: Yes

**Response**:

```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

### Set Default Payment Method

Sets a payment method as the default for the user.

**URL**: `/billing/payment-methods/{payment_method_id}/default`

**Method**: `POST`

**Auth required**: Yes

**Response**:

```json
{
  "success": true,
  "message": "Default payment method updated successfully"
}
```

### Get Available Plans

Retrieves all available subscription plans.

**URL**: `/billing/plans`

**Method**: `GET`

**Auth required**: No

**Response**:

```json
{
  "plans": {
    "free": {
      "id": "free",
      "name": "Free",
      "price": 0.0,
      "interval": "month",
      "features": [
        "Up to 3 images per month",
        "2x and 4x upscaling",
        "Basic upscaling mode",
        "Standard support"
      ],
      "limits": {
        "images_per_month": 3,
        "max_scale_factor": 4,
        "api_calls_per_month": 0,
        "storage_gb": 0.1
      }
    },
    "pro": {
      "id": "pro",
      "name": "Pro",
      "price": 15.00,
      "interval": "month",
      "features": [
        "Unlimited images",
        "Up to 16x upscaling",
        "All upscaling modes",
        "API access",
        "Priority support"
      ],
      "limits": {
        "images_per_month": 100,
        "max_scale_factor": 16,
        "api_calls_per_month": 500,
        "storage_gb": 5
      }
    },
    "enterprise": {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 30.00,
      "interval": "month",
      "features": [
        "Unlimited images",
        "Up to 16x upscaling",
        "All upscaling modes",
        "Unlimited API access",
        "Dedicated support",
        "Custom integration"
      ],
      "limits": {
        "images_per_month": 1000,
        "max_scale_factor": 16,
        "api_calls_per_month": 5000,
        "storage_gb": 20
      }
    }
  }
}
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication is required
- `403 Forbidden`: The authenticated user does not have permission
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

Error responses include a detail message:

```json
{
  "detail": "Error message"
}
``` 