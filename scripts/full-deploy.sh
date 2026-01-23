#!/bin/bash
# full-deploy.sh
# Complete deployment pipeline: build → upload → deploy
# Usage: ./scripts/full-deploy.sh [PROFILE] [EMAIL] [APP_NAME]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PROFILE=${1:-e2-demo-field}
EMAIL=${2:-kaustav.paul@databricks.com}
APP_NAME=${3:-dtc-exec-view-app}

echo -e "${BLUE}🚀 Full Deployment Pipeline${NC}"
echo "=================================================="
echo "Profile: $PROFILE"
echo "User: $EMAIL"
echo "App: $APP_NAME"
echo ""

# Step 1: Build bundle
echo -e "${BLUE}[1/3] Building deployment bundle...${NC}"
./scripts/build-deploy-bundle.sh
if [ $? -ne 0 ]; then
    echo "Build failed. Aborting."
    exit 1
fi

# Step 2: Upload to workspace
echo -e "\n${BLUE}[2/3] Uploading to workspace...${NC}"
./scripts/deploy-to-workspace.sh "$PROFILE" "$EMAIL"
if [ $? -ne 0 ]; then
    echo "Upload failed. Aborting."
    exit 1
fi

# Step 3: Deploy app
echo -e "\n${BLUE}[3/3] Deploying app...${NC}"
./scripts/deploy-app.sh "$PROFILE" "$EMAIL" "$APP_NAME"
if [ $? -ne 0 ]; then
    echo "Deployment failed."
    exit 1
fi

# Success
echo ""
echo "=================================================="
echo -e "${GREEN}✅ Full deployment complete!${NC}"
echo ""
echo "Access your app at:"
APP_URL=$(databricks apps get "$APP_NAME" --profile "$PROFILE" --output json 2>/dev/null | jq -r '.url // "Check Databricks workspace"')
echo -e "${GREEN}$APP_URL${NC}"
