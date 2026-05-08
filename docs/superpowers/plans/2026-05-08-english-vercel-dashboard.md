# English Vercel Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locale-configured English dashboard for a separate Vercel project while leaving Turkish as the default Firebase build.

**Architecture:** Add a small locale/text module and thread its strings through the active dashboard components. Keep data fetching shared and unchanged, and add Vercel build metadata plus README deployment instructions.

**Tech Stack:** React, Vite, Node test runner, Recharts, Tailwind CSS, Vercel static deployment.

---

### Task 1: Locale Text Foundation

**Files:**
- Create: `src/components/dashboardText.js`
- Modify: `src/dashboardMetrics.test.js`
- Modify: `src/components/dashboardMetrics.js`

- [ ] **Step 1: Write failing locale tests**

Add tests that import `getDashboardLocale`, `getDashboardText`, and `formatMetric`, then assert Turkish default behavior and English opt-in behavior:

```js
import { getDashboardLocale, getDashboardText } from './components/dashboardText.js';

test('dashboard locale defaults to Turkish and supports English opt-in', () => {
  assert.equal(getDashboardLocale({}), 'tr');
  assert.equal(getDashboardLocale({ VITE_DASHBOARD_LOCALE: 'en' }), 'en');
});

test('English dashboard text is available for the Vercel deployment', () => {
  const text = getDashboardText('en');

  assert.equal(text.title, 'Turkey Inflation Dashboard');
  assert.equal(text.mode.monthly.label, 'Monthly');
  assert.equal(text.recentMonthsTitle, 'Last 12 months');
});

test('English difference metrics use percentage points', () => {
  assert.equal(formatMetric(1.25, 'difference', getDashboardText('en').units), '+1.25 pp');
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`

Expected: fail because `src/components/dashboardText.js` does not exist or exported functions are missing.

- [ ] **Step 3: Implement locale text module and metric formatter option**

Create `dashboardText.js` with `tr` and `en` copy. Update `formatPoints` and `formatMetric` in `dashboardMetrics.js` to accept an optional unit text object.

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test`

Expected: all tests pass.

### Task 2: Wire Locale Into Active UI

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/InflationDashboard.jsx`
- Modify: `src/components/LoadingScreen.jsx`

- [ ] **Step 1: Use locale in `App.jsx`**

Derive `locale` from `getDashboardLocale(import.meta.env)` and `text` from `getDashboardText(locale)`. Pass `text` into `LoadingScreen` and `InflationDashboard`. Replace hard-coded Turkish error copy with `text.error`.

- [ ] **Step 2: Use text in `InflationDashboard.jsx`**

Replace active hard-coded Turkish labels with fields from `text`, including the header, mode buttons, chart descriptions, metric card average label, recent table, difference summary, footer, and `formatMetric(..., text.units)`.

- [ ] **Step 3: Use text in `LoadingScreen.jsx`**

Replace loading title, subtitle, and description with `text.loading`.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all tests pass.

### Task 3: Vercel Deployment Metadata and Docs

**Files:**
- Create: `vercel.json`
- Modify: `README.md`

- [ ] **Step 1: Add Vercel config**

Create `vercel.json` with Vite framework, build command, and `dist` output directory.

- [ ] **Step 2: Update README deployment notes**

Document that the Turkish deployment remains Firebase by default, while the English Vercel project should set `VITE_DASHBOARD_LOCALE=en` and can reuse the same `VITE_GOOGLE_SHEETS_CSV_URL`.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit successfully.
