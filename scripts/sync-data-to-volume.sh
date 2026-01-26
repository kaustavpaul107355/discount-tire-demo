#!/bin/bash

# Databricks Data Sync Script
# Syncs local CSV files to Databricks Volume

set -e

# Color codes for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROFILE="${DATABRICKS_PROFILE:-e2-demo-field}"
VOLUME_PATH="dbfs:/Volumes/kaustavpaul_demo/dtc_demo/dtc_files/data"
LOCAL_DATA_DIR="../data"
WORKSPACE_HOST="e2-demo-field-eng.cloud.databricks.com"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_DIR="$SCRIPT_DIR/$LOCAL_DATA_DIR"

echo -e "${BLUE}📤 Syncing Data to Databricks Volume${NC}"
echo "=================================================="
echo "Profile: $PROFILE"
echo "Volume: $VOLUME_PATH"
echo "Local: $DATA_DIR"
echo ""

# Check if data directory exists
if [ ! -d "$DATA_DIR" ]; then
    echo -e "${RED}❌ Error: Data directory not found at $DATA_DIR${NC}"
    exit 1
fi

# Count CSV files
CSV_COUNT=$(ls -1 "$DATA_DIR"/*.csv 2>/dev/null | wc -l)
if [ "$CSV_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ Error: No CSV files found in $DATA_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}Found $CSV_COUNT CSV file(s) to upload${NC}"
echo ""

# Check if volume exists
echo -e "${BLUE}🔍 Checking if volume exists...${NC}"
if ! databricks fs ls "$VOLUME_PATH" --profile "$PROFILE" >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Cannot access volume!${NC}"
    echo ""
    echo "Volume path: $VOLUME_PATH"
    echo ""
    echo "Please check:"
    echo "  1. Volume exists in workspace"
    echo "  2. You have permissions to access it"
    echo "  3. Profile '$PROFILE' has correct credentials"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Volume accessible${NC}"
echo ""

# Upload each CSV file
SUCCESS_COUNT=0
FAIL_COUNT=0

for csv_file in "$DATA_DIR"/*.csv; do
    filename=$(basename "$csv_file")
    filesize=$(du -h "$csv_file" | cut -f1)
    
    echo -e "${BLUE}⬆️  Uploading $filename ($filesize)...${NC}"
    
    # Upload to Volume
    UPLOAD_OUTPUT=$(databricks fs cp "$csv_file" "$VOLUME_PATH/$filename" --overwrite --profile "$PROFILE" 2>&1)
    UPLOAD_STATUS=$?
    
    if [ $UPLOAD_STATUS -eq 0 ]; then
        echo -e "${GREEN}✅ Uploaded $filename${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌ Failed to upload $filename${NC}"
        echo "Error: $UPLOAD_OUTPUT"
        ((FAIL_COUNT++))
    fi
    echo ""
done

echo "=================================================="
echo -e "${GREEN}✅ Successfully uploaded: $SUCCESS_COUNT file(s)${NC}"
if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ Failed uploads: $FAIL_COUNT file(s)${NC}"
    echo ""
    echo "Please check:"
    echo "  - Volume permissions"
    echo "  - Network connectivity"
    echo "  - Databricks CLI profile configuration"
    exit 1
fi
echo ""

# Verify uploads
echo -e "${BLUE}📋 Files now in Volume:${NC}"
echo ""
databricks fs ls "$VOLUME_PATH" --profile "$PROFILE" 2>/dev/null | head -15 || echo -e "${YELLOW}⚠️  Could not list volume contents${NC}"
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}✅ Data sync complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run the notebook to refresh Delta tables:"
echo "     /Workspace/Users/kaustav.paul@databricks.com/discount-tire-demo/notebooks/discount_tire_demo"
echo ""
echo "  2. Dashboard will show updated data after:"
echo "     - Tables are refreshed (run notebook)"
echo "     - Cache expires (30-60 seconds)"
echo ""
