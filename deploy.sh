#!/bin/bash
set -e

# Project Configuration
PROJECT_ID="project-aether-486817"
SERVICE_NAME="aether-app"
REGION="us-central1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment for Project Aether...${NC}"

# Check for gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    exit 1
fi

# Set Project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Load environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}Error: .env file not found. Please create one with API_KEY and OAUTH_ID.${NC}"
    exit 1
fi

# Check required variables
if [ -z "$API_KEY" ] || [ -z "$OAUTH_ID" ]; then
    echo -e "${RED}Error: API_KEY or OAUTH_ID not set in .env.${NC}"
    exit 1
fi

# Enable Services (idempotent)
echo "Enabling necessary services..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Build and Submit
echo "Building and submitting container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed.${NC}"
    exit 1
fi

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "VITE_GEMINI_API_KEY=${API_KEY},GOOGLE_CLIENT_ID=${OAUTH_ID}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed.${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment successful!${NC}"
