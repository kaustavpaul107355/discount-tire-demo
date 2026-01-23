#!/bin/bash
# build-deploy-bundle.sh
# Creates a clean deployment bundle for Databricks Apps
# Usage: ./scripts/build-deploy-bundle.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 Building Discount Tire Demo Deployment Bundle${NC}"
echo "=================================================="

# Step 1: Build frontend
echo -e "\n${YELLOW}Step 1/4: Building frontend...${NC}"
cd ui
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built successfully${NC}"

# Step 2: Clean old bundle
echo -e "\n${YELLOW}Step 2/4: Cleaning old deployment bundle...${NC}"
rm -rf ui_deploy
mkdir -p ui_deploy
echo -e "${GREEN}✅ Old bundle cleaned${NC}"

# Step 3: Copy essential files
echo -e "\n${YELLOW}Step 3/4: Copying essential files...${NC}"

# Copy built frontend
echo "  📦 Copying dist/ (built frontend)..."
cp -r ui/dist ui_deploy/

# Copy backend
echo "  🐍 Copying backend/ (Python server)..."
cp -r ui/backend ui_deploy/

# Copy configuration
echo "  ⚙️  Copying app.yaml (configuration)..."
if [ ! -f ui/app.yaml ]; then
    echo -e "${YELLOW}⚠️  Warning: ui/app.yaml not found. Using app_git.yaml as template.${NC}"
    echo -e "${YELLOW}   Please update ui_deploy/app.yaml with actual credentials.${NC}"
    cp ui/app_git.yaml ui_deploy/app.yaml
else
    cp ui/app.yaml ui_deploy/
fi

# Copy entry point
echo "  📄 Copying index.html (entry point)..."
cp ui/index.html ui_deploy/

# Copy Python dependencies
echo "  📋 Copying requirements.txt (Python deps)..."
if [ -f ui/requirements.txt ]; then
    cp ui/requirements.txt ui_deploy/
else
    echo -e "${YELLOW}⚠️  Warning: ui/requirements.txt not found. Creating default.${NC}"
    cat > ui_deploy/requirements.txt <<EOF
# Python dependencies for Databricks App
databricks-sql-connector>=3.0.0
requests>=2.32.0
EOF
fi

echo -e "${GREEN}✅ Files copied${NC}"

# Step 4: Validate and report
echo -e "\n${YELLOW}Step 4/4: Validating bundle...${NC}"

# Check bundle size
BUNDLE_SIZE=$(du -sh ui_deploy | cut -f1)
echo "  📊 Bundle size: $BUNDLE_SIZE"

# Check for required files
REQUIRED_FILES=("dist" "backend" "app.yaml" "index.html" "requirements.txt")
ALL_PRESENT=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "ui_deploy/$file" ]; then
        echo "  ✅ $file present"
    else
        echo "  ❌ $file MISSING"
        ALL_PRESENT=false
    fi
done

# Final report
echo ""
echo "=================================================="
if [ "$ALL_PRESENT" = true ]; then
    echo -e "${GREEN}✅ Deployment bundle ready!${NC}"
    echo -e "${GREEN}   Location: ui_deploy/${NC}"
    echo -e "${GREEN}   Size: $BUNDLE_SIZE${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Verify app.yaml has correct credentials"
    echo "  2. Run: ./scripts/deploy-to-workspace.sh"
    exit 0
else
    echo -e "${YELLOW}⚠️  Bundle created but some files are missing${NC}"
    echo "   Please review and fix before deploying."
    exit 1
fi
