#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Preparing for deployment to Render.com...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is required but not installed. Please install Git and try again.${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo -e "${RED}Not in a git repository. Please run this script from the root of your git repository.${NC}"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}There are uncommitted changes. Committing them before deployment...${NC}"
    git add .
    git commit -m "Prepare for deployment to Render.com"
fi

# Push to the repository
echo -e "${YELLOW}Pushing to the repository...${NC}"
git push

echo -e "${GREEN}Deployment preparation complete!${NC}"
echo -e "${YELLOW}Now go to your Render.com dashboard and deploy the service.${NC}"
echo -e "${YELLOW}Make sure to set all the required environment variables in the Render.com dashboard.${NC}"
echo -e "${YELLOW}You can use the .env.production file as a template for the environment variables.${NC}" 