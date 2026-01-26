# Changelog

All notable changes to the Discount Tire Executive Dashboard project.

## [1.0.0] - 2026-01-26

### 🎉 Initial Production Release

---

## Recent Updates

### Data & Analytics Enhancements
**Date:** 2026-01-26

#### Revenue Analytics
- ✅ **Realistic Target Revenue**: Replaced static quarterly targets with dynamic monthly variations using seasonal patterns and trends
- ✅ **Last Year Revenue**: Generated synthetic historical data with independent patterns (12% YoY growth baseline)
- ✅ **Service Category Revenue**: Added synthetic revenue generation (15% of total) to ensure Service category always shows meaningful contribution

#### Customer Insights
- ✅ **Feedback Sentiment Diversity**: Implemented realistic sentiment distribution
  - Tire: Always positive (high satisfaction)
  - Service: Neutral or negative (max 1 negative)
  - Wheel: Positive or neutral based on satisfaction
  - Accessory: Neutral
- ✅ **Top Feedback Topics**: Now shows varied positive, neutral, and negative sentiments

#### Store Maps
- ✅ **Expanded Metrics**: Increased store-level highlights from 10 to 20 KPI tiles
  - Added: Median Revenue/Store, Lowest Performers, Top State/Region, Active States, Avg Revenue/State, High/Low Performers

---

### Performance & UX Improvements
**Date:** 2026-01-26

#### Loading Experience
- ✅ **Skeleton Loaders**: Beautiful animated placeholders for all data-heavy components
  - StatCard skeletons for metrics
  - Chart skeletons for visualizations
  - Table skeletons for data grids
  - Pulse animations for visual feedback

#### Transition Smoothness
- ✅ **Eliminated Flicker**: Removed state-based transitions causing page flicker
- ✅ **CSS Animations**: Implemented smooth 200ms fadeIn keyframe animations
- ✅ **Optimized Rendering**: Removed unnecessary React re-renders

#### Initial Load Time
- ✅ **Instant Feedback**: Skeleton loaders appear immediately (<100ms)
- ✅ **Better Perceived Performance**: Visual structure shown during data loading
- ✅ **Code Splitting**: Lazy-loaded components maintained

---

### Feature Additions

#### Knowledge Assistant (Tire Care Tab)
**Date:** 2026-01-23

- ✅ **Chat Interface**: Powered by Databricks Knowledge Assistant agent
- ✅ **6 Suggested Questions**: Expanded from 4 to 6 tire care questions
- ✅ **Persistent Suggestions**: Questions remain visible after first interaction
- ✅ **Real-time Responses**: Agent-based conversational AI
- ✅ **Updated Description**: Improved information disclaimer text

#### AI Executive Summary Enhancements
**Date:** 2026-01-23

- ✅ **Voice Input with Pause Detection**: 2-second silence timeout for natural conversation
- ✅ **Text-to-Speech (TTS)**:
  - Punctuation handling (`;` → `,`, `:` → `.`)
  - Markdown stripping before speech
  - Play/Stop toggle
  - Natural pauses at punctuation
- ✅ **Reset Button**: Clear AI response and return to idle state
- ✅ **5th Follow-up Question**: Added "Show sales by quarter"

---

### Infrastructure & Deployment

#### Automated Deployment Scripts
**Date:** 2026-01-23

- ✅ **`full-deploy.sh`**: One-command deployment pipeline (~1 minute)
- ✅ **`build-deploy-bundle.sh`**: Optimized bundle creation (~1.2MB)
- ✅ **`deploy-to-workspace.sh`**: Workspace upload automation
- ✅ **`deploy-app.sh`**: App deployment with status monitoring
- ✅ **`sync-data-to-volume.sh`**: CSV data upload utility

#### Data Management
**Date:** 2026-01-26

- ✅ **Volume Path Fixed**: Corrected to use `dbfs:` prefix for UC Volumes
- ✅ **Data Sync Script**: Automated upload of 12 CSV files to Databricks Volume
- ✅ **Notebook Updates**: Added table/view drop logic to prevent schema conflicts

---

### Bug Fixes

#### Data Ingestion
**Date:** 2026-01-26

- 🐛 **Fixed**: `DELTA_FAILED_TO_MERGE_FIELDS` error in notebook
  - Added explicit table drops before creation
  - Added view drops before creation
  - Added success confirmation messages

#### API Integration
**Date:** 2026-01-23

- 🐛 **Fixed**: Knowledge Assistant `INVALID_PARAMETER_VALUE` error
  - Corrected payload format: `{"input": [{"role": "user", "content": "..."}]}`
  - Fixed response parsing from `output` array
  - Added proper error handling and logging

#### Backend Caching
**Date:** 2026-01-23

- 🐛 **Fixed**: Data changes not appearing due to aggressive caching
  - Reduced `SQL_CACHE_TTL` from 300s to 60s
  - Reduced `DASHBOARD_CACHE_TTL` from 120s to 30s
  - Added `/api/cache/clear` endpoint for manual cache invalidation

---

### Technical Debt & Code Quality

#### Documentation Consolidation
**Date:** 2026-01-26

- ✅ **Cleaned Up**: Removed 14 duplicate markdown files from root
- ✅ **Centralized**: All docs now in `docs/` subdirectories
- ✅ **Updated Main README**: Comprehensive project documentation
- ✅ **Created CHANGELOG**: This file for version tracking

#### Code Organization
- ✅ **New Component**: `LoadingSkeleton.tsx` for reusable loading states
- ✅ **Updated Styles**: Added fadeIn animation to `theme.css`
- ✅ **Removed Dead Code**: Eliminated `isTabTransitioning` state

---

## Performance Metrics

### Bundle Sizes
```
LoadingSkeleton:     0.69 KB (gzipped: 0.29 KB)
TireCare:            5.32 KB (gzipped: 2.18 KB)
Operations:          7.98 KB (gzipped: 2.68 KB)
RevenueAnalytics:   30.75 KB (gzipped: 8.68 KB)
CustomerInsights:   35.81 KB (gzipped: 10.01 KB)
MapView:           165.78 KB (gzipped: 52.05 KB)
Main Bundle:       588.60 KB (gzipped: 170.34 KB)
```

### Cache Configuration
```
Genie Cache TTL:     300 seconds (5 minutes)
SQL Cache TTL:        60 seconds (1 minute)
Dashboard Cache TTL:  30 seconds (30 seconds)
```

### User Experience
```
Initial Load:           <100ms (skeleton display)
Tab Transition:         200ms (smooth fade)
Data Fetch (cached):    <50ms
Data Fetch (uncached):  500-2000ms
```

---

## Known Issues

### Performance
- ⚠️ Main bundle size is 588KB (consider further code splitting for <500KB)
- ⚠️ Some lazy-loaded components could benefit from prefetching

### Features
- ℹ️ Voice input requires browser support (Chrome/Edge recommended)
- ℹ️ TTS may have different voice quality across browsers
- ℹ️ Mobile layout could be further optimized

---

## Upcoming Improvements

### Short Term
- [ ] Further code splitting to reduce main bundle
- [ ] Add data prefetching for better tab switches
- [ ] Mobile layout optimizations
- [ ] Add more unit tests (target: 80% coverage)

### Long Term
- [ ] Offline support with Service Workers
- [ ] Progressive Web App (PWA) capabilities
- [ ] Advanced caching strategies
- [ ] Real-time data updates via WebSockets
- [ ] Additional dashboards (inventory deep-dive, staffing)

---

## Migration Notes

### From Previous Versions
N/A - This is the initial production release

---

## Contributors

**Primary Developer:** Kaustav Paul (kaustav.paul@databricks.com)  
**Organization:** Databricks Field Engineering  
**Project Type:** Internal Demo

---

**Versioning:** We follow [Semantic Versioning](https://semver.org/)  
**Format:** Based on [Keep a Changelog](https://keepachangelog.com/)
