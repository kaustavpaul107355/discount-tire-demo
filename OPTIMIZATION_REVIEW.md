# Codebase Optimization Review (Pre–Git Check-in)

**Date:** January 2026  
**Scope:** Full repo review for performance, maintainability, and check-in readiness.

---

## ✅ Implemented Optimizations

### 1. **Frontend bundle splitting (Vite)**
- **Change:** `ui/vite.config.ts` – added `build.rollupOptions.output.manualChunks` to split:
  - `recharts` – chart library (~580 KB), loads when user opens Revenue/Operations/Customer/Chart tabs
  - `leaflet` – map library, loads when user opens Store Map
  - `markdown` – react-markdown + remark-gfm, loads when user opens AI Assistant
  - `lucide` – icons, shared across tabs
- **Result:** Main app bundle reduced from ~590 KB to ~38 KB; heavy libs load on demand with lazy routes. Faster initial load.

### 2. **Chunk size warning**
- **Change:** `chunkSizeWarningLimit: 600` so the single large `recharts` chunk does not trigger the build warning. Recharts is a known heavy dependency; further splitting would require deeper refactors.

---

## 📋 Git Check-in Checklist

Before committing:

- [ ] **Secrets:** Ensure `ui/app.yaml` is **not** committed (it contains tokens). It is listed in `.gitignore`. Use `app_git.yaml` as a template without real values if you need a committed config sample.
- [ ] **Build artifacts:** `ui/dist/`, `ui_deploy/`, `ui/node_modules/` are ignored. Do not force-add them.
- [ ] **Python:** `__pycache__/` and `*.pyc` are ignored.
- [ ] Run `npm run build` in `ui/` and fix any failures.
- [ ] Run `npm test` in `ui/` and fix any failures.
- [ ] (Optional) Run `pytest ui/backend/tests/` for backend tests.

---

## 🔍 Optional / Future Optimizations

### Dependencies (package.json)
- **Current:** Many dependencies appear to come from a template (e.g. MUI, Radix, react-dnd, react-slick, embla-carousel, date-fns, react-hook-form, vaul, cmdk). The app **source** only uses: `react`, `react-dom`, `lucide-react`, `recharts`, `react-markdown`, `remark-gfm`, `react-leaflet`, `leaflet`, `tw-animate-css` (via Tailwind), and dev/test deps.
- **Optional:** Audit and remove unused production dependencies to speed up installs and reduce supply-chain surface. Low urgency; template may be shared.

### Backend (server.py)
- **Catalog/schema:** SQL uses hardcoded `kaustavpaul_demo.dtc_demo` in many places (~29 occurrences). For portability, consider env vars (e.g. `UC_CATALOG`, `UC_SCHEMA`) and a single helper. Optional for this repo if it stays single-tenant.
- **Caching:** Genie/SQL/Dashboard TTLs and semaphore are already env-configurable. No change needed.

### Frontend consistency
- **API calls:** Each component uses raw `fetch()` with local `mounted` and error handling. Optional: small `api.get(url)` helper for consistency and central error/toast handling. Not required for current size.
- **Types:** Dashboard API response types could be shared (e.g. `types/dashboard.ts`) instead of inline `any` in a few places. Improves type safety over time.

### .gitignore
- Already includes: `ui/app.yaml`, `ui/dist/`, `ui_deploy/`, `ui/node_modules/`, `__pycache__/`, `*.py[cod]`, `coverage/`. No change required.

---

## 📁 Key Paths (Reminder)

| Path | Purpose |
|------|--------|
| `ui/src/app/` | React app and components |
| `ui/backend/server.py` | Python HTTP server and API |
| `ui/app.yaml` | **Do not commit** – env and secrets |
| `ui/app_git.yaml` | Template/sample config (safe to commit if present) |
| `scripts/full-deploy.sh` | One-command build + upload + deploy |
| `.gitignore` | Ensures app.yaml, dist, ui_deploy, node_modules ignored |

---

## Summary

- **Done:** Bundle splitting and chunk limit for faster initial load and a clean build.
- **Before check-in:** Confirm app.yaml is not committed, build and tests pass.
- **Later (optional):** Trim unused deps, env-based catalog in backend, shared API/type helpers.
