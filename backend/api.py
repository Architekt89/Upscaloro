from backend.database import DatabaseHandler

@app.get("/subscription/{user_id}", tags=["Subscription"])
async def get_subscription(user_id: str, request: Request):
    """
    Get subscription information for a user
    """
    try:
        # Verify the user is authenticated
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Not authenticated"
            )
        
        # Extract the token
        token = auth_header.split(" ")[1]
        
        # Verify the token (this is a simplified approach)
        # In a real app, you would verify the token with your auth provider
        # and ensure the requesting user has permission to access this user's data
        try:
            # For now, we'll just check if the user exists
            user = await DatabaseHandler.get_user(user_id)
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail="User not found"
                )
        except Exception as e:
            logger.error(f"Error verifying user: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )
        
        # Query the subscriptions table
        try:
            # Get the subscription from the database
            subscription = await DatabaseHandler.get_subscription(user_id)
            
            if not subscription:
                return {
                    "status": "success",
                    "data": {
                        "has_subscription": False,
                        "subscription_tier": "free",
                        "subscription_status": None,
                        "current_period_end": None
                    }
                }
            
            # Return the subscription data
            return {
                "status": "success",
                "data": {
                    "has_subscription": True,
                    "subscription_tier": subscription.get("plan", "free"),
                    "subscription_status": subscription.get("status"),
                    "current_period_end": subscription.get("current_period_end")
                }
            }
        except Exception as e:
            logger.error(f"Error retrieving subscription: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error retrieving subscription: {str(e)}"
            )
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error in get_subscription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 