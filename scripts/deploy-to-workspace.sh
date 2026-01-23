#!/bin/bash
# deploy-to-workspace.sh
# Uploads deployment bundle to Databricks workspace
# Usage: ./scripts/deploy-to-workspace.sh [PROFILE] [EMAIL]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
PROFILE=${1:-e2-demo-field}
EMAIL=${2:-kaustav.paul@databricks.com}

echo -e "${BLUE}⬆️  Uploading to Databricks Workspace${NC}"
echo "=================================================="
echo "Profile: $PROFILE"
echo "User: $EMAIL"
echo ""

# Check if bundle exists
if [ ! -d "ui_deploy" ]; then
    echo -e "${RED}❌ Error: ui_deploy/ directory not found${NC}"
    echo "   Run ./scripts/build-deploy-bundle.sh first"
    exit 1
fi

# Check bundle size
BUNDLE_SIZE=$(du -sh ui_deploy | cut -f1)
echo -e "${YELLOW}Bundle size: $BUNDLE_SIZE${NC}"

# Warn if bundle is too large
BUNDLE_SIZE_BYTES=$(du -s ui_deploy | cut -f1)
if [ "$BUNDLE_SIZE_BYTES" -gt 10240 ]; then  # 10MB
    echo -e "${YELLOW}⚠️  Warning: Bundle is larger than 10MB${NC}"
    echo "   This may indicate node_modules or other bloat."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Upload to workspace
echo -e "\n${YELLOW}Uploading to workspace...${NC}"
WORKSPACE_PATH="/Workspace/Users/$EMAIL/discount-tire-demo/ui"

databricks workspace import-dir ui_deploy \
  "$WORKSPACE_PATH" \
  --overwrite \
  --profile "$PROFILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo -e "${GREEN}✅ Upload complete!${NC}"
    echo -e "${GREEN}   Workspace path: $WORKSPACE_PATH${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./scripts/deploy-app.sh"
    exit 0
else
    echo -e "${RED}❌ Upload failed${NC}"
    echo "   Check your Databricks CLI configuration"
    echo "   Run: databricks configure --profile $PROFILE"
    exit 1
fi
