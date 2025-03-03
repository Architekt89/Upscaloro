#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Upscalor...${NC}"

# Check for required dependencies
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is required but not installed. Please install Python 3 and try again.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is required but not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is required but not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file in root directory...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please update .env with your credentials.${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Creating .env file in frontend directory...${NC}"
    cp frontend/.env.example frontend/.env
    echo -e "${YELLOW}Please update frontend/.env with your credentials.${NC}"
fi

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating .env file in backend directory...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}Please update backend/.env with your credentials.${NC}"
fi

# Synchronize environment variables if frontend/.env exists
if [ -f "frontend/.env" ]; then
    echo -e "${YELLOW}Synchronizing environment variables...${NC}"
    
    # Extract Supabase values from frontend/.env
    SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL frontend/.env | cut -d '=' -f2)
    SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY frontend/.env | cut -d '=' -f2)
    SUPABASE_JWT_SECRET=$(grep SUPABASE_JWT_SECRET frontend/.env | cut -d '=' -f2)
    
    # Update backend/.env with Supabase values
    if [ ! -z "$SUPABASE_URL" ]; then
        sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|g" backend/.env
    fi
    
    if [ ! -z "$SUPABASE_JWT_SECRET" ]; then
        # Check if SUPABASE_JWT_SECRET already exists in the file
        if grep -q "SUPABASE_JWT_SECRET" backend/.env; then
            sed -i.bak "s|SUPABASE_JWT_SECRET=.*|SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET|g" backend/.env
        else
            # Add it after SUPABASE_KEY
            sed -i.bak "/SUPABASE_KEY=.*/a SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET" backend/.env
        fi
    fi
    
    # Update root .env with Supabase values
    if [ ! -z "$SUPABASE_URL" ]; then
        sed -i.bak "s|SUPABASE_URL=.*|SUPABASE_URL=$SUPABASE_URL|g" .env
    fi
    
    if [ ! -z "$SUPABASE_JWT_SECRET" ]; then
        sed -i.bak "s|SUPABASE_JWT_SECRET=.*|SUPABASE_JWT_SECRET=$SUPABASE_JWT_SECRET|g" .env
    fi
    
    # Clean up backup files
    rm -f backend/.env.bak .env.bak
    
    echo -e "${GREEN}Environment variables synchronized!${NC}"
fi

# Set up backend
echo -e "${YELLOW}Setting up backend...${NC}"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Set up frontend
echo -e "${YELLOW}Setting up frontend...${NC}"
cd frontend
npm install
cd ..

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}To start the backend:${NC}"
echo -e "cd backend"
echo -e "source venv/bin/activate"
echo -e "uvicorn main:app --reload"
echo -e "${YELLOW}To start the frontend:${NC}"
echo -e "cd frontend"
echo -e "npm run dev"
echo -e "${YELLOW}Don't forget to update your environment variables in the .env files!${NC}" 