# Deployment Scripts

Automated scripts for safe, fast, and repeatable Databricks App deployments.

## 🎯 Quick Start

### Full Deployment (Recommended)
Deploy everything in one command:
```bash
./scripts/full-deploy.sh
```

### Step-by-Step Deployment
For more control, run each step individually:

```bash
# 1. Build deployment bundle
./scripts/build-deploy-bundle.sh

# 2. Upload to workspace
./scripts/deploy-to-workspace.sh

# 3. Deploy app
./scripts/deploy-app.sh
```

---

## 📜 Scripts

### `build-deploy-bundle.sh`
**Purpose**: Creates a clean deployment bundle

**What it does**:
1. Builds frontend (`npm run build`)
2. Creates `ui_deploy/` directory
3. Copies only essential files:
   - `dist/` (built frontend, ~1MB)
   - `backend/` (Python server, ~200KB)
   - `app.yaml` (configuration)
   - `index.html` (entry point)
   - `requirements.txt` (Python deps)
4. Validates bundle integrity
5. Reports bundle size

**Usage**:
```bash
./scripts/build-deploy-bundle.sh
```

**Output**:
- Creates `ui_deploy/` directory (~1.1MB)
- Validates all required files present
- Reports bundle size and status

**Expected time**: ~30 seconds

---

### `deploy-to-workspace.sh`
**Purpose**: Uploads clean bundle to Databricks workspace

**What it does**:
1. Validates `ui_deploy/` exists
2. Checks bundle size (warns if > 10MB)
3. Uploads to workspace via Databricks CLI
4. Confirms successful upload

**Usage**:
```bash
# With defaults
./scripts/deploy-to-workspace.sh

# With custom profile and email
./scripts/deploy-to-workspace.sh my-profile user@example.com
```

**Parameters**:
- `PROFILE` (optional): Databricks CLI profile (default: `e2-demo-field`)
- `EMAIL` (optional): Your email (default: `kaustav.paul@databricks.com`)

**Output**:
- Uploads to: `/Workspace/Users/{EMAIL}/discount-tire-demo/ui`
- Confirms successful upload

**Expected time**: ~10 seconds

---

### `deploy-app.sh`
**Purpose**: Deploys app to Databricks Apps platform

**What it does**:
1. Initiates app deployment
2. Monitors deployment progress
3. Reports final status and URL

**Usage**:
```bash
# With defaults
./scripts/deploy-app.sh

# With custom values
./scripts/deploy-app.sh my-profile user@example.com my-app-name
```

**Parameters**:
- `PROFILE` (optional): Databricks CLI profile (default: `e2-demo-field`)
- `EMAIL` (optional): Your email (default: `kaustav.paul@databricks.com`)
- `APP_NAME` (optional): App name (default: `dtc-exec-view-app`)

**Output**:
- Deployment status (IN_PROGRESS, SUCCEEDED, FAILED)
- App URL when successful
- Duration in seconds

**Expected time**: ~10-20 seconds

---

### `full-deploy.sh`
**Purpose**: Complete deployment pipeline in one command

**What it does**:
1. Runs `build-deploy-bundle.sh`
2. Runs `deploy-to-workspace.sh`
3. Runs `deploy-app.sh`
4. Reports final status and URL

**Usage**:
```bash
# With defaults
./scripts/full-deploy.sh

# With custom values
./scripts/full-deploy.sh my-profile user@example.com my-app-name
```

**Parameters**:
- `PROFILE` (optional): Databricks CLI profile
- `EMAIL` (optional): Your email
- `APP_NAME` (optional): App name

**Output**:
- Combined output from all three scripts
- Final app URL

**Expected time**: ~1 minute total

---

## ⚠️ Important Notes

### Prerequisites
- Node.js 18+ and npm installed
- Databricks CLI configured (`databricks configure --profile your-profile`)
- `jq` installed (for JSON parsing)
- Proper permissions on Databricks workspace

### Before First Use
1. Verify `ui/app.yaml` has correct credentials:
   ```yaml
   env:
     - name: "DATABRICKS_HOST"
       value: "your-workspace.cloud.databricks.com"
     - name: "DATABRICKS_SQL_HTTP_PATH"
       value: "/sql/1.0/warehouses/your-warehouse-id"
     # ... other env vars
   ```

2. Test Databricks CLI:
   ```bash
   databricks workspace list /Workspace/Users --profile your-profile
   ```

### Troubleshooting

#### "Bundle not found" error
**Solution**: Run `build-deploy-bundle.sh` first

#### "Upload failed" error
**Causes**:
- Invalid Databricks CLI profile
- Network issues
- Insufficient permissions

**Solution**: Check profile with:
```bash
databricks configure --profile your-profile
databricks workspace list /Workspace/Users --profile your-profile
```

#### "Deployment taking too long"
**If deployment is IN_PROGRESS for > 2 minutes**:

Check logs:
```bash
databricks apps get dtc-exec-view-app --profile your-profile
```

#### Bundle size warning
**If bundle > 10MB, likely causes**:
- `node_modules/` accidentally included
- Large files in `ui/dist/`
- Bloat in `ui/backend/`

**Solution**: Review `ui_deploy/` contents, rebuild if needed

---

## 📊 Performance Metrics

| Metric | Time | Size |
|--------|------|------|
| Build bundle | ~30s | ~1.1MB |
| Upload to workspace | ~10s | ~1.1MB |
| Deploy app | ~10-20s | - |
| **Total (full-deploy)** | **~1min** | **~1.1MB** |

**Compare to manual process**:
- Manual: 20+ minutes, 410MB, error-prone
- Automated: ~1 minute, 1.1MB, reliable

---

## 🔄 Typical Workflow

### Daily Development
```bash
# Make changes to code
# Test locally
npm run dev

# Deploy when ready
./scripts/full-deploy.sh
```

### Quick Iterations
```bash
# Already built? Just upload and deploy
./scripts/deploy-to-workspace.sh && ./scripts/deploy-app.sh
```

### Production Deployment
```bash
# Clean build
rm -rf ui/dist ui_deploy

# Full pipeline with production profile
./scripts/full-deploy.sh production-profile prod-email prod-app-name
```

---

## 🎓 Best Practices

### DO:
- ✅ Always use these scripts for deployment
- ✅ Verify `app.yaml` before deploying
- ✅ Check bundle size after build
- ✅ Test locally before deploying
- ✅ Commit code before deploying

### DON'T:
- ❌ Deploy directly from `ui/` directory
- ❌ Manually upload files to workspace
- ❌ Skip the build step
- ❌ Commit `ui/app.yaml` to git
- ❌ Deploy untested code

---

## 📝 Logs & Debugging

### View Script Output
All scripts provide colored, step-by-step output:
- 🔵 Blue = Info/Step
- 🟡 Yellow = Warning/In Progress
- 🟢 Green = Success
- 🔴 Red = Error

### Debug Failed Deployments
```bash
# Check app status
databricks apps get dtc-exec-view-app --profile e2-demo-field

# View app configuration
databricks apps get dtc-exec-view-app --profile e2-demo-field --output json | jq

# List deployments
databricks apps list-deployments dtc-exec-view-app --profile e2-demo-field
```

---

## 🆘 Getting Help

### Common Issues

**Q**: Scripts won't execute  
**A**: Make them executable: `chmod +x scripts/*.sh`

**Q**: Bundle is too large  
**A**: Check `ui_deploy/` for unexpected files, rebuild

**Q**: Deployment fails with "Error building app"  
**A**: Check `requirements.txt` exists, verify Python syntax

**Q**: Can't find Databricks CLI  
**A**: Install: `pip install databricks-cli`

### Still Stuck?
1. Check `CODEBASE_ASSESSMENT.md` for detailed troubleshooting
2. Check `DEPLOYMENT_GUIDE.md` for manual deployment steps
3. Review app logs in Databricks workspace

---

**Created**: January 23, 2026  
**Version**: 1.0  
**Maintainer**: Databricks Field Engineering
