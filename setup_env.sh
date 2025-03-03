#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up environment variables for Upscalor...${NC}"

# Check if frontend/.env exists
if [ -f "frontend/.env" ]; then
    echo -e "${YELLOW}Found frontend/.env${NC}"
    
    # Extract Supabase values from frontend/.env
    SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL frontend/.env | cut -d '=' -f2)
    SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY frontend/.env | cut -d '=' -f2)
    SUPABASE_JWT_SECRET=$(grep SUPABASE_JWT_SECRET frontend/.env | cut -d '=' -f2)
    
    # Check if backend/.env exists, create if not
    if [ ! -f "backend/.env" ]; then
        echo -e "${YELLOW}Creating backend/.env${NC}"
        cp backend/.env.example backend/.env
    fi
    
    # Update backend/.env with Supabase values
    if [ ! -z "$SUPABASE_URL" ]; then
        sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|g" backend/.env
        echo -e "${GREEN}Updated SUPABASE_URL in backend/.env${NC}"
    fi
    
    if [ ! -z "$SUPABASE_JWT_SECRET" ]; then
        # Check if SUPABASE_JWT_SECRET already exists in the file
        if grep -q "SUPABASE_JWT_SECRET" backend/.env; then
            sed -i.bak "s|SUPABASE_JWT_SECRET=.*|SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET|g" backend/.env
        else
            # Add it after SUPABASE_KEY
            sed -i.bak "/SUPABASE_KEY=.*/a SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET" backend/.env
        fi
        echo -e "${GREEN}Updated SUPABASE_JWT_SECRET in backend/.env${NC}"
    fi
    
    # Create root .env if it doesn't exist
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Creating root .env${NC}"
        cp .env.example .env
        
        # Update root .env with Supabase values
        if [ ! -z "$SUPABASE_URL" ]; then
            sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|g" .env
        fi
        
        if [ ! -z "$SUPABASE_JWT_SECRET" ]; then
            sed -i.bak "s|SUPABASE_JWT_SECRET=.*|SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET|g" .env
        fi
        
        echo -e "${GREEN}Updated root .env with Supabase values${NC}"
    fi
    
    # Clean up backup files
    rm -f backend/.env.bak .env.bak
    
    echo -e "${GREEN}Environment setup complete!${NC}"
    echo -e "${YELLOW}Note: You may need to manually update other environment variables like API keys.${NC}"
else
    echo -e "${RED}Error: frontend/.env not found. Please create it first.${NC}"
    exit 1
fi 