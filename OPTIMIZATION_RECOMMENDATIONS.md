# Code Optimization Opportunities

**Last Review:** January 26, 2026  
**Reviewer:** AI Assistant  
**Project:** Discount Tire Executive Dashboard

---

## 📊 Current State

### Bundle Analysis
```
Total Bundle Size:     1.2 MB (deployment)
Main JS Bundle:      588.6 KB (gzipped: 170.3 KB)
Largest Component:   MapView (165.78 KB, gzipped: 52.05 KB)
node_modules:          416 MB
```

### Component Count
- **Actual Used Components:** 14 (in `/src/app/components/`)
- **Unused UI Library:** 46 components (in `/src/app/components/ui/`)
- **Lazy-Loaded:** 5 components (Revenue, Operations, Customers, Maps, TireCare)

---

## ✅ Already Optimized

### Performance
- ✅ Lazy loading for heavy components
- ✅ Multi-layer caching (Genie, SQL, Dashboard)
- ✅ Skeleton loaders for perceived performance
- ✅ CSS animations (no JS transitions)
- ✅ Optimized React rendering (eliminated unnecessary re-renders)

### Build
- ✅ Vite build optimization
- ✅ Tree shaking enabled
- ✅ Code splitting via lazy imports
- ✅ Minification and gzipping

### Code Quality
- ✅ TypeScript for type safety
- ✅ ESLint configuration
- ✅ Organized component structure
- ✅ Centralized styling

---

## 🎯 Recommended Optimizations

### High Priority (Quick Wins)

#### 1. Remove Unused UI Components
**Impact:** Reduce bundle size by ~50-100 KB  
**Effort:** Low (15 minutes)

```bash
# Remove unused shadcn/ui components
rm -rf ui/src/app/components/ui/
```

**Justification:**
- 46 unused UI library components
- Never imported in actual code
- Pure template code from UI library setup
- Safe to delete (no dependencies)

**Estimated Savings:** 50-100 KB gzipped

---

#### 2. Optimize MapView Component
**Impact:** Reduce largest component by 20-30%  
**Effort:** Medium (1-2 hours)

**Current Size:** 165.78 KB (gzipped: 52.05 KB)

**Optimizations:**
```typescript
// Split map initialization and data loading
const MapCore = lazy(() => import('./MapCore'));
const MapData = lazy(() => import('./MapData'));

// Use dynamic imports for Leaflet
const loadLeaflet = () => import('leaflet');

// Memoize expensive calculations
const memoizedStats = useMemo(() => calculateStats(data), [data]);
```

**Estimated Savings:** 30-50 KB gzipped

---

#### 3. Image Optimization
**Impact:** Faster logo loading  
**Effort:** Low (10 minutes)

```bash
# Optimize SVG logos
npm install -D svgo
svgo DT_logo.svg DBX_logo.svg
```

**Estimated Savings:** Minor, but improves initial paint

---

### Medium Priority

#### 4. Further Code Splitting
**Impact:** Reduce initial bundle  
**Effort:** Medium (2-3 hours)

**Strategy:**
```typescript
// Split recharts imports
const AreaChart = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
const BarChart = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));

// Split by route/tab
const createTabComponent = (name) => lazy(() => import(`./components/${name}`));
```

**Target:** Get main bundle under 500 KB

---

#### 5. Implement Prefetching
**Impact:** Faster tab switching  
**Effort:** Medium (1-2 hours)

```typescript
// Prefetch next likely tab
useEffect(() => {
  if (activeTab === 'home') {
    // Preload Revenue Analytics (most common next tab)
    import('./components/RevenueAnalytics');
  }
}, [activeTab]);
```

**Benefit:** Near-instant tab switches

---

#### 6. Virtual Scrolling for Large Lists
**Impact:** Better performance with large datasets  
**Effort:** Medium (2-3 hours)

```bash
npm install react-virtual
```

```typescript
// For store lists and data tables
import { useVirtual } from 'react-virtual';
```

**Use Cases:**
- Store lists (100+ stores)
- Transaction tables
- Feedback lists

---

### Low Priority (Future Enhancements)

#### 7. Service Worker & PWA
**Impact:** Offline support, faster repeat loads  
**Effort:** High (4-6 hours)

```typescript
// Workbox for caching strategy
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
```

**Benefits:**
- Offline functionality
- Instant repeat loads
- Background sync

---

#### 8. WebP Images (if adding images)
**Impact:** 25-35% smaller images  
**Effort:** Low (30 minutes)

```typescript
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="fallback" />
</picture>
```

---

#### 9. HTTP/2 Server Push
**Impact:** Faster resource loading  
**Effort:** High (Databricks Apps integration)

**Note:** Would require Databricks Apps platform support

---

## 📈 Dependency Optimization

### Current Dependencies Analysis

**Large Dependencies:**
```
recharts:  ~50 KB (gzipped)
leaflet:   ~40 KB (gzipped)
react:     ~35 KB (gzipped)
```

### Alternatives Considered

#### Recharts → Lightweight Chart Library?
**Decision:** Keep recharts
- Rich features needed for our charts
- Good API and documentation
- Savings would be minimal (<20 KB)

#### Leaflet → React Simple Maps?
**Decision:** Keep leaflet
- Need interactive features
- Well-maintained
- Store map is core feature

---

## 🧹 Code Cleanup Opportunities

### Remove Unused Code

#### 1. Unused Imports (if any)
Run automated cleanup:
```bash
npm install -D eslint-plugin-unused-imports
```

#### 2. Dead Code Elimination
Already handled by:
- Vite tree shaking
- Rollup optimization
- TypeScript unused detection

#### 3. Duplicate Utilities
Check for duplicate helper functions:
```bash
find ui/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "formatCurrency"
```

---

## 📊 Testing Performance Impact

### Before Optimization
```
Initial Load:     ~2.5s (3G)
Time to Interactive: ~3.0s
Bundle Size:      588.6 KB (gzipped: 170.3 KB)
```

### Target After Optimization
```
Initial Load:     ~1.8s (3G)
Time to Interactive: ~2.2s
Bundle Size:      <500 KB (gzipped: <150 KB)
```

### Measurement Tools
```bash
# Lighthouse audit
npm run build && npx serve dist

# Bundle analyzer
npm install -D rollup-plugin-visualizer
```

---

## 🎯 Action Plan

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Remove unused UI components (15 min)
2. ✅ Optimize SVG logos (10 min)
3. ✅ Add bundle analyzer (30 min)
4. ✅ Review and remove unused dependencies (30 min)

### Phase 2: Medium Optimizations (4-6 hours)
1. Optimize MapView component (2 hours)
2. Implement tab prefetching (2 hours)
3. Further code splitting (2 hours)

### Phase 3: Advanced (8-12 hours)
1. Service Worker implementation (4 hours)
2. PWA setup (3 hours)
3. Virtual scrolling (3 hours)
4. Advanced caching strategies (2 hours)

---

## 📝 Notes

### Why Not Implemented Yet?
- **Current performance is acceptable** - 170 KB gzipped is reasonable
- **Development velocity prioritized** - Ship features first
- **Databricks Apps constraints** - Some optimizations need platform support

### When to Optimize?
- **If bundle exceeds 600 KB** (currently 588 KB, close to threshold)
- **If user feedback indicates slowness**
- **Before public demo or customer presentation**
- **When adding major new features**

---

## ✅ Immediate Action Items

For next session:

```bash
# 1. Remove unused UI components
rm -rf ui/src/app/components/ui/

# 2. Verify nothing breaks
npm run build
npm test

# 3. Deploy if successful
./scripts/full-deploy.sh
```

**Expected outcome:** Cleaner codebase, slightly smaller bundle, no functionality loss.

---

**Last Updated:** January 26, 2026  
**Status:** Documentation Complete  
**Next Review:** Before next major feature addition
