# Databricks App Deployment Guide

## Quick Deploy

```bash
# 1. Build frontend
cd ui
npm run build

# 2. Create clean deployment bundle
cd ..
rm -rf ui_deploy
mkdir -p ui_deploy
cp -r ui/dist ui_deploy/
cp -r ui/backend ui_deploy/
cp ui/app.yaml ui_deploy/
cp ui/index.html ui_deploy/
cp ui/requirements.txt ui_deploy/

# 3. Upload to Databricks workspace
databricks workspace import-dir ui_deploy /Workspace/Users/YOUR_EMAIL/discount-tire-demo/ui --overwrite --profile YOUR_PROFILE

# 4. Deploy app
databricks apps deploy dtc-exec-view-app --source-code-path /Workspace/Users/YOUR_EMAIL/discount-tire-demo/ui --profile YOUR_PROFILE
```

## Important Notes

### ⚠️ DO NOT Upload These:
- `node_modules/` (408MB - causes 10+ minute deployments!)
- `src/` (source files - already compiled to dist/)
- `package.json`, `package-lock.json`
- `vite.config.ts`, `tsconfig.json`, etc.
- Test files, documentation

### ✅ Only Upload:
- `dist/` - Built frontend (~1MB)
- `backend/` - Python server
- `app.yaml` - Configuration
- `index.html` - Entry point
- `requirements.txt` - Python dependencies

## Deployment Bundle Contents

```
ui_deploy/
├── dist/              # Built frontend assets
│   ├── assets/        # JS, CSS, images
│   └── index.html
├── backend/           # Python server
│   ├── server.py
│   ├── db_pool.py
│   └── tests/
├── app.yaml           # App configuration
├── index.html         # Root entry point
└── requirements.txt   # Python dependencies
```

## Required Files

### requirements.txt
```
databricks-sql-connector>=3.0.0
requests>=2.32.0
```

### app.yaml
Must include all required environment variables:
- `DATABRICKS_HOST`
- `DATABRICKS_SQL_HTTP_PATH`
- `DATABRICKS_TOKEN_FOR_SQL`
- `GENIE_SPACE_ID`
- `DATABRICKS_TOKEN_FOR_GENIE`
- `KNOWLEDGE_ASSISTANT_ENDPOINT` (for Tire Care feature)

## Troubleshooting

### Deployment Taking Too Long (>2 minutes)?
**Cause**: Workspace contains bloated files (node_modules, src, etc.)

**Fix**:
```bash
# Delete workspace directory
databricks workspace delete /Workspace/Users/YOUR_EMAIL/discount-tire-demo/ui --profile YOUR_PROFILE --recursive

# Re-upload clean bundle
databricks workspace import-dir ui_deploy /Workspace/Users/YOUR_EMAIL/discount-tire-demo/ui --overwrite --profile YOUR_PROFILE
```

### Deployment Fails with "Error building app"?
**Possible causes**:
1. Missing `requirements.txt`
2. Wrong Python dependencies
3. Syntax errors in Python code
4. Missing environment variables in `app.yaml`

**Fix**: Check app logs and validate all files compile:
```bash
cd ui_deploy
python3 -m py_compile backend/server.py
python3 -m py_compile backend/db_pool.py
```

### App Won't Start?
**Check**:
1. `app.yaml` has correct environment variables
2. SQL Warehouse ID is valid and running
3. Tokens have not expired
4. All Python imports work (databricks.sql, requests)

## Performance Metrics

| Metric | Optimized | Bloated |
|--------|-----------|---------|
| Upload Size | 1.1MB | 410MB |
| Upload Time | 10s | 10+ min |
| Deployment Time | 7s | 10+ min or fail |
| Total Time | ~20s | 20+ min |

## Best Practices

1. **Always build frontend first**: `npm run build`
2. **Use deployment bundle**: Don't upload from `ui/` directly
3. **Keep workspace clean**: Delete and re-upload if bloated
4. **Test Python locally**: `python3 -m py_compile backend/server.py`
5. **Verify app.yaml**: Check all env vars before deploy
6. **Monitor deployment**: Should complete in <30 seconds

## Common Commands

```bash
# Check app status
databricks apps get dtc-exec-view-app --profile e2-demo-field

# Stop app
databricks apps stop dtc-exec-view-app --profile e2-demo-field

# Start app
databricks apps start dtc-exec-view-app --profile e2-demo-field

# List deployments
databricks apps list-deployments dtc-exec-view-app --profile e2-demo-field

# Check workspace contents
databricks workspace list /Workspace/Users/YOUR_EMAIL/discount-tire-demo/ui --profile YOUR_PROFILE
```

## Deployment Checklist

Before deploying:
- [ ] Frontend built (`npm run build` completed)
- [ ] Clean deployment bundle created
- [ ] `requirements.txt` exists with correct dependencies
- [ ] `app.yaml` has all required env vars
- [ ] Python files compile without errors
- [ ] Workspace is clean (no node_modules)
- [ ] SQL Warehouse is running
- [ ] Tokens are valid

After deploying:
- [ ] Deployment succeeds in <30 seconds
- [ ] App status shows "RUNNING"
- [ ] App URL returns HTTP 200/302
- [ ] All tabs load correctly
- [ ] Backend endpoints respond
- [ ] Knowledge assistant works
