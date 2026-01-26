# Discount Tire Executive Dashboard

**AI-Powered Executive Analytics Platform for Discount Tire**

[![Databricks](https://img.shields.io/badge/Databricks-Apps-FF3621?logo=databricks)](https://databricks.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://www.python.org/)

---

## 📊 Overview

A modern executive dashboard leveraging Databricks AI (Genie) and Unity Catalog to provide real-time insights across revenue, operations, customer satisfaction, and store performance. Built with React 18, TypeScript, and deployed as a Databricks App.

**Key Features:**
- 🎤 **Voice-powered AI queries** with natural language processing
- 🗣️ **Text-to-speech responses** for accessibility
- 📈 **Real-time analytics** with live data from Unity Catalog
- 🗺️ **Interactive store maps** with performance metrics
- 💬 **Knowledge Assistant** for tire care and safety guidance
- 🎨 **Beautiful glassmorphism UI** with smooth animations

**Live Dashboard:** [View App](https://dtc-exec-view-app-1444828305810485.aws.databricksapps.com)

---

## 🏗️ Architecture

```
discount-tire-demo/
├── ui/                          # React Frontend
│   ├── src/app/
│   │   ├── components/         # UI Components
│   │   │   ├── ExecutiveSummary.tsx
│   │   │   ├── RevenueAnalytics.tsx
│   │   │   ├── CustomerInsights.tsx
│   │   │   ├── Operations.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── TireCare.tsx        # Knowledge Assistant
│   │   │   └── LoadingSkeleton.tsx  # Loading states
│   │   ├── styles/             # CSS & Themes
│   │   └── App.tsx             # Main app
│   ├── backend/
│   │   ├── server.py           # Python backend
│   │   ├── db_pool.py          # DB connections
│   │   └── tests/              # Backend tests
│   ├── dist/                   # Built assets
│   └── app.yaml               # Databricks App config
├── data/                       # CSV source files (12 files)
├── notebooks/
│   └── discount_tire_demo.py  # Data ingestion notebook
├── scripts/                    # Deployment automation
│   ├── full-deploy.sh         # One-command deployment
│   ├── sync-data-to-volume.sh # Data upload utility
│   └── README.md              # Scripts documentation
└── docs/                       # Project documentation
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- Python 3.10+
- Databricks CLI configured
- Access to Databricks workspace

### **1. Local Development**

```bash
# Clone and install
cd discount-tire-demo/ui
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### **2. Deploy to Databricks**

```bash
# One-command deployment
./scripts/full-deploy.sh

# Or step-by-step:
./scripts/build-deploy-bundle.sh    # Build
./scripts/deploy-to-workspace.sh    # Upload
./scripts/deploy-app.sh             # Deploy
```

### **3. Sync Data**

```bash
# Upload CSV files to Databricks Volume
./scripts/sync-data-to-volume.sh

# Run notebook to create tables
# Execute: /Workspace/Users/kaustav.paul@databricks.com/discount-tire-demo/notebooks/discount_tire_demo
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md) | Complete deployment instructions |
| [Scripts README](./scripts/README.md) | Deployment scripts documentation |
| [Architecture](./docs/architecture/CODEBASE_ASSESSMENT.md) | Technical architecture overview |
| [Testing](./TEST_COVERAGE_REPORT.md) | Test coverage and quality metrics |
| [Code Quality](./docs/development/CODE_QUALITY_ASSESSMENT.md) | Code review and standards |

---

## 🎯 Features

### **1. Executive Summary (Home Tab)**
- AI-powered query interface (voice & text)
- Text-to-speech for responses
- Follow-up question suggestions
- Key performance metrics
- Quick insights charts

### **2. Revenue Analytics**
- Current month & YTD revenue
- Monthly trend vs target with realistic synthetic data
- Revenue by category with Service revenue generation
- Regional quarterly performance

### **3. Customer Insights**
- Overall satisfaction scores
- Net Promoter Score (NPS)
- Feedback topics with sentiment (positive/neutral/negative)
- Regional satisfaction trends
- Service breakdown analysis

### **4. Operations**
- Inventory tracking by store
- Stock turnover metrics
- Critical low-stock alerts
- Store performance rankings

### **5. Store Maps**
- Interactive map with 100+ store locations
- 20 performance metric tiles
- Store-level highlights
- Geographic performance analysis

### **6. Tire Care Knowledge Assistant**
- Chat interface powered by Databricks Knowledge Assistant
- 6 suggested questions
- Real-time responses
- Tire safety and maintenance guidance

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Leaflet** - Interactive maps
- **Web Speech API** - Voice input/output

### **Backend**
- **Python 3.10** - Backend logic
- **ThreadingHTTPServer** - HTTP server
- **Databricks SDK** - Unity Catalog integration
- **Multi-layer caching** - Performance optimization

### **Data & AI**
- **Databricks Genie** - Natural language queries
- **Databricks Knowledge Assistant** - Chat AI
- **Unity Catalog** - Data governance
- **Delta Lake** - Data storage
- **SQL Warehouse** - Direct query execution

### **Deployment**
- **Databricks Apps** - Hosting platform
- **Bash scripts** - Automated deployment
- **Databricks CLI** - Workspace management

---

## 📊 Data Sources

**12 CSV Files** → **Unity Catalog Delta Tables**:

| File | Records | Description |
|------|---------|-------------|
| `customers.csv` | ~500 | Customer demographics & satisfaction |
| `products.csv` | 12 | Product catalog (Tires, Wheels, Services, Accessories) |
| `sales.csv` | ~1,000 | Transaction history |
| `stores.csv` | 100 | Store locations & details |
| `inventory.csv` | ~400 | Current stock levels |
| `services.csv` | ~200 | Service records |
| `appointments.csv` | ~1,000 | Appointment history |
| `surveys.csv` | ~1,000 | Customer feedback |
| `feedback_topics.csv` | ~1,000 | Categorized feedback |
| `promotions.csv` | 8 | Active promotions |
| `inventory_movements.csv` | ~2,000 | Stock movements |
| `store_kpis.csv` | ~300 | Store performance KPIs |

**Location:** `/Volumes/kaustavpaul_demo/dtc_demo/dtc_files/data/`

---

## ⚡ Performance Features

### **Loading Optimizations**
- ✅ Lazy-loaded components for faster initial load
- ✅ Skeleton loaders for better perceived performance
- ✅ Smooth fade-in animations (200ms)
- ✅ Multi-layer caching (Genie: 300s, SQL: 60s, Dashboard: 30s)

### **UI/UX Enhancements**
- ✅ No flicker transitions between tabs
- ✅ Instant visual feedback during data loading
- ✅ Glassmorphism panels with hover effects
- ✅ Animated gradient background
- ✅ Responsive design (mobile-friendly)

### **Bundle Size**
```
Main bundle: 588 KB (gzipped: 170 KB)
Charts: 166 KB (gzipped: 52 KB)
Total initial: ~755 KB (gzipped: ~222 KB)
```

---

## 🔧 Configuration

### **Environment Variables** (`ui/app.yaml`)

```yaml
env:
  - name: "DATABRICKS_HOST"
    value: "e2-demo-field-eng.cloud.databricks.com"
  - name: "DATABRICKS_SQL_HTTP_PATH"
    value: "/sql/1.0/warehouses/..."
  - name: "DATABRICKS_TOKEN_FOR_GENIE"
    valueFrom: "genie-pat"
  - name: "DATABRICKS_TOKEN_FOR_SERVING"
    valueFrom: "serving-pat"
```

### **Cache Configuration** (`ui/backend/server.py`)

```python
GENIE_CACHE_TTL_SECONDS = 300        # 5 minutes
SQL_CACHE_TTL_SECONDS = 60           # 1 minute
DASHBOARD_CACHE_TTL_SECONDS = 30     # 30 seconds
```

---

## 🧪 Testing

```bash
# Run all tests
cd ui
npm test

# With coverage
npm run test:coverage

# Backend tests
pytest ui/backend/tests/

# Current Coverage: 68%
```

**Test Coverage Report:** [TEST_COVERAGE_REPORT.md](./TEST_COVERAGE_REPORT.md)

---

## 🚢 Deployment

### **Automated Deployment (Recommended)**

```bash
./scripts/full-deploy.sh
```

**What it does:**
1. Builds frontend (`npm run build`)
2. Creates optimized deployment bundle (~1.2MB)
3. Uploads to Databricks workspace
4. Deploys as Databricks App
5. Reports final URL

**Duration:** ~1 minute

### **Manual Deployment**

See [DEPLOYMENT_GUIDE.md](./docs/deployment/DEPLOYMENT_GUIDE.md) for detailed manual steps.

---

## 📈 Recent Improvements

### **Data Enhancements**
- ✅ Realistic target revenue with quarterly variations
- ✅ Synthetic Service category revenue (15% of total)
- ✅ Diverse feedback sentiment (positive/neutral/negative, max 1 negative)
- ✅ Expanded store-level metrics (20 KPI tiles)

### **Performance**
- ✅ Skeleton loading animations
- ✅ Eliminated page flicker
- ✅ Smooth 200ms transitions
- ✅ Optimized React rendering

### **Features**
- ✅ Voice input with pause detection
- ✅ Text-to-speech with punctuation handling
- ✅ Reset button for AI responses
- ✅ Knowledge Assistant tab (6 suggested questions)
- ✅ Data sync utility script

---

## 🔗 Key Links

- **Live Dashboard:** https://dtc-exec-view-app-1444828305810485.aws.databricksapps.com
- **Workspace:** https://e2-demo-field-eng.cloud.databricks.com
- **Catalog:** `kaustavpaul_demo.dtc_demo`
- **Volume:** `/Volumes/kaustavpaul_demo/dtc_demo/dtc_files/data`
- **Notebook:** `/Workspace/Users/kaustav.paul@databricks.com/discount-tire-demo/notebooks/discount_tire_demo`

---

## 🤝 Contributing

### **Code Style**
- Follow TypeScript/React best practices
- Use Tailwind CSS for styling
- Add tests for new features
- Update documentation

### **Commit Workflow**
```bash
# Make changes
git add .
git commit -m "feat: description"
git push origin main
```

---

## 📝 License

Internal Databricks Field Engineering Demo

---

## 👥 Team

**Maintainer:** Kaustav Paul (kaustav.paul@databricks.com)  
**Organization:** Databricks Field Engineering

---

## 🎓 Learning Resources

- [Databricks Apps Documentation](https://docs.databricks.com/en/dev-tools/databricks-apps/index.html)
- [Genie API Guide](https://docs.databricks.com/en/genie/api-guide.html)
- [Unity Catalog](https://docs.databricks.com/en/data-governance/unity-catalog/index.html)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Last Updated:** January 26, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
