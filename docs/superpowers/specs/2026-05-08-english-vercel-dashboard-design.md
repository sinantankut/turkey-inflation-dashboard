# English Vercel Dashboard Design

## Goal

Create an English version of the Turkey inflation dashboard for a separate Vercel project while preserving the Turkish Firebase version and keeping both versions connected to the same Google Sheets data source.

## Architecture

The repository will remain a single Vite/React application. Turkish remains the default UI so the existing Firebase deployment keeps its current behavior. The English Vercel deployment opts into English with `VITE_DASHBOARD_LOCALE=en`.

The Google Sheets loader stays shared. Both deployments use the same default sheet URL unless a deployment overrides `VITE_GOOGLE_SHEETS_CSV_URL`.

## Components

- `src/components/dashboardText.js` will own locale selection and UI strings.
- `src/components/dashboardMetrics.js` will keep metric calculations and source metadata, with labels adjusted through the selected locale where needed.
- `src/App.jsx`, `src/components/InflationDashboard.jsx`, and `src/components/LoadingScreen.jsx` will receive or derive localized text and render the same dashboard structure.
- `vercel.json` will document the Vite build and output directory for Vercel.
- `README.md` will explain the Firebase/Turkish and Vercel/English deployment split.

## Data Flow

On load, the app fetches Google Sheets CSV data through the existing `fetchInflationData()` path. If the sheet cannot be read, it falls back to bundled JSON data. Locale selection affects only labels, descriptions, loading/error messages, and formatting of "percentage points"; it does not alter source data, calculations, sorting, or fallbacks.

## Error Handling

The current data fetch error path stays in place. Error copy becomes locale-aware so the Turkish Firebase version and English Vercel version show the appropriate message.

## Testing

Add focused Node tests for locale selection, English dashboard strings, and English percentage-point formatting. Run the existing test suite, lint, and production build after implementation.
