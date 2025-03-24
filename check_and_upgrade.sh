#!/bin/bash

# Script to check and fix subscription issues

# Load environment variables if .env file exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python and pip are installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed. Please install Python 3 to use this script.${NC}"
    exit 1
fi

# Check if requests module is installed, if not, install it
if ! python3 -c "import requests" &> /dev/null; then
    echo -e "${YELLOW}Installing required Python module: requests${NC}"
    pip install requests
fi

# Check if dotenv module is installed, if not, install it
if ! python3 -c "import dotenv" &> /dev/null; then
    echo -e "${YELLOW}Installing required Python module: python-dotenv${NC}"
    pip install python-dotenv
fi

# Check for Python Supabase library
if ! python3 -c "import supabase" &> /dev/null; then
    echo -e "${YELLOW}Installing required Python module: supabase-py${NC}"
    pip install supabase
fi

# Function to check a user's subscription status
check_subscription() {
    email="$1"
    echo -e "${BLUE}Checking subscription status for: ${email}${NC}"
    
    # Call the API endpoint to check subscription status
    response=$(python3 -c "
import requests
import os
from dotenv import load_dotenv

load_dotenv()

email = '$email'
api_url = f'https://upscaloro.onrender.com/api/subscription/check?email={email}'

try:
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        print(f\"Current subscription tier: {data.get('subscription_tier', 'unknown')}\")
        print(f\"Subscription status: {data.get('subscription_status', 'unknown')}\")
        print(f\"Subscription end date: {data.get('subscription_end_date', 'unknown')}\")
        print(f\"User ID: {data.get('user_id', 'unknown')}\")
        exit(0 if data.get('subscription_tier') == 'enterprise' else 1)
    else:
        print(f\"Error: {response.status_code} - {response.text}\")
        exit(2)
except Exception as e:
    print(f\"Error checking subscription: {str(e)}\")
    exit(2)
")
    
    status=$?
    echo "$response"
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✓ User is already on Enterprise plan${NC}"
        return 0
    elif [ $status -eq 1 ]; then
        echo -e "${YELLOW}! User is NOT on Enterprise plan${NC}"
        return 1
    else:
        echo -e "${RED}✗ Error checking subscription status${NC}"
        return 2
    fi
}

# Function to directly update the database (most reliable method)
update_db_directly() {
    email="$1"
    plan="${2:-enterprise}"
    
    echo -e "${BLUE}Directly updating database for ${email} to ${plan} plan...${NC}"
    
    # Direct SQL update via Python Supabase client
    response=$(python3 -c "
import os
import json
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Get variables
email = '$email'
plan = '$plan'
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print('Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment variables')
    exit(1)

try:
    # Initialize Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # First find the user
    user_response = supabase.table('users').select('*').eq('email', email).execute()
    
    if not user_response.data or len(user_response.data) == 0:
        print(f'Error: User with email {email} not found')
        exit(1)
    
    # Get user data
    user = user_response.data[0]
    user_id = user.get('id')
    current_tier = user.get('subscription_tier', 'free')
    
    print(f'Found user ID: {user_id}, current tier: {current_tier}')
    
    # Set subscription end date to 1 year from now for manual upgrades
    current_period_end = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
    
    # Prepare user update data
    update_data = {
        'subscription_tier': plan,
        'subscription_status': 'active',
        'subscription_current_period_end': current_period_end,
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    
    # Update the user record
    update_response = supabase.table('users').update(update_data).eq('id', user_id).execute()
    
    if update_response.data and len(update_response.data) > 0:
        print(f'Successfully updated user {user_id} to {plan} tier')
        user_success = True
    else:
        print(f'Failed to update user {user_id}')
        user_success = False
    
    # Also update subscription record
    subscription_data = {
        'user_id': user_id,
        'plan': plan,
        'status': 'active',
        'current_period_end': datetime.now(timezone.utc) + timedelta(days=365),
        'email': email,
        'stripe_customer_id': 'manual_direct_update',
        'stripe_subscription_id': 'manual_direct_update',
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    
    # Check if subscription record exists
    sub_response = supabase.table('subscriptions').select('*').eq('user_id', user_id).execute()
    
    if sub_response.data and len(sub_response.data) > 0:
        # Update existing subscription
        sub_update = supabase.table('subscriptions').update(subscription_data).eq('user_id', user_id).execute()
        print(f'Updated existing subscription record')
    else:
        # Insert new subscription
        sub_insert = supabase.table('subscriptions').insert(subscription_data).execute()
        print(f'Created new subscription record')
    
    # Also update user metadata in auth
    try:
        auth_response = supabase.auth.admin.update_user_by_id(
            user_id,
            user_metadata={
                'subscription_tier': plan,
                'subscription_status': 'active',
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
        )
        print(f'Updated user auth metadata')
    except Exception as e:
        print(f'Warning: Failed to update auth metadata: {str(e)}')
    
    # Verify the changes
    verify_response = supabase.table('users').select('subscription_tier').eq('id', user_id).execute()
    
    if verify_response.data and len(verify_response.data) > 0:
        current_tier = verify_response.data[0].get('subscription_tier')
        if current_tier == plan:
            print(f'Verification successful: user tier is now {plan}')
            exit(0)
        else:
            print(f'Verification failed: user tier is still {current_tier}')
            exit(1)
    else:
        print('Verification failed: could not retrieve user')
        exit(1)
        
except Exception as e:
    print(f'Error updating database: {str(e)}')
    exit(1)
")
    
    status=$?
    echo "$response"
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully updated database for ${email} to ${plan} plan${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to update database${NC}"
        return 1
    fi
}

# Function to fix a user's subscription
fix_subscription() {
    email="$1"
    plan="${2:-enterprise}"
    
    echo -e "${BLUE}Upgrading ${email} to ${plan} plan...${NC}"
    
    # First try direct database update (most reliable)
    echo -e "${BLUE}Attempting direct database update (most reliable method)...${NC}"
    update_db_directly "$email" "$plan"
    direct_status=$?
    
    # If direct update succeeded, we're done
    if [ $direct_status -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully upgraded user via direct database update${NC}"
        return 0
    fi
    
    # If direct update failed, try the API endpoint
    echo -e "${YELLOW}Direct update failed, trying API endpoint...${NC}"
    
    # Call the API endpoint to fix the subscription
    response=$(python3 -c "
import requests
import os
from dotenv import load_dotenv

load_dotenv()

email = '$email'
plan = '$plan'
admin_key = os.getenv('ADMIN_API_KEY')

if not admin_key:
    print('Error: ADMIN_API_KEY not found in environment variables')
    exit(1)

api_url = 'https://upscaloro.onrender.com/api/manual-upgrade'
payload = {
    'email': email,
    'plan': plan,
    'admin_key': admin_key
}

try:
    response = requests.post(api_url, json=payload)
    if response.status_code == 200:
        data = response.json()
        print(f\"Success: {data.get('message')}\")
        exit(0)
    else:
        try:
            error_data = response.json()
            print(f\"API error: {error_data.get('error')}\")
        except:
            print(f\"API error: Status code {response.status_code}\")
        exit(1)
except Exception as e:
    print(f\"Error fixing subscription: {str(e)}\")
    exit(1)
")
    
    status=$?
    echo "$response"
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully upgraded user to ${plan} plan via API${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to upgrade user via both methods${NC}"
        return 1
    fi
}

# Main function
main() {
    # Display help if no arguments or help flag
    if [ $# -eq 0 ] || [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
        echo "Usage: ./check_and_upgrade.sh [command] [options]"
        echo ""
        echo "Commands:"
        echo "  check <email>            Check subscription status for an email"
        echo "  fix <email> [plan]       Fix subscription for an email (defaults to enterprise)"
        echo "  direct <email> [plan]    Directly update database for an email (most reliable, requires DB credentials)"
        echo "  batch <file>             Process a batch of emails from a file (one email per line)"
        echo ""
        echo "Examples:"
        echo "  ./check_and_upgrade.sh check user@example.com"
        echo "  ./check_and_upgrade.sh fix user@example.com enterprise" 
        echo "  ./check_and_upgrade.sh direct user@example.com enterprise"
        echo "  ./check_and_upgrade.sh batch emails.txt"
        exit 0
    fi
    
    command="$1"
    
    case "$command" in
        check)
            if [ $# -lt 2 ]; then
                echo -e "${RED}Error: Email is required for check command${NC}"
                exit 1
            fi
            check_subscription "$2"
            ;;
        fix)
            if [ $# -lt 2 ]; then
                echo -e "${RED}Error: Email is required for fix command${NC}"
                exit 1
            fi
            plan="${3:-enterprise}"
            fix_subscription "$2" "$plan"
            ;;
        direct)
            if [ $# -lt 2 ]; then
                echo -e "${RED}Error: Email is required for direct command${NC}"
                exit 1
            fi
            plan="${3:-enterprise}"
            update_db_directly "$2" "$plan"
            ;;
        batch)
            if [ $# -lt 2 ]; then
                echo -e "${RED}Error: File path is required for batch command${NC}"
                exit 1
            fi
            
            if [ ! -f "$2" ]; then
                echo -e "${RED}Error: File not found: $2${NC}"
                exit 1
            fi
            
            while IFS= read -r email || [ -n "$email" ]; do
                # Skip empty lines and comments
                if [ -z "$email" ] || [[ "$email" == \#* ]]; then
                    continue
                fi
                
                echo -e "\n${BLUE}Processing: $email${NC}"
                check_subscription "$email"
                status=$?
                
                if [ $status -eq 1 ]; then
                    echo -e "${YELLOW}This user needs to be upgraded to Enterprise plan${NC}"
                    read -p "Do you want to upgrade this user to Enterprise using direct database update? (y/n): " choice
                    if [[ $choice == [Yy]* ]]; then
                        # Use direct update for batch processing (most reliable)
                        update_db_directly "$email" "enterprise"
                        
                        # Verify the change
                        echo -e "\n${BLUE}Verifying the upgrade...${NC}"
                        check_subscription "$email"
                    else
                        echo -e "${YELLOW}Skipping upgrade for $email${NC}"
                    fi
                fi
                
                echo -e "${BLUE}----------------------------------------${NC}"
            done < "$2"
            ;;
        *)
            echo -e "${RED}Error: Unknown command: $command${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

# Call the main function with all arguments
main "$@" 