import assert from 'node:assert/strict';
import test from 'node:test';
import { rowsToInflationData } from './data/inflationData.js';
import {
  formatMetric,
  getLatestEntry,
  getPeriodAverages,
  getSeriesRangeLabel,
  toChartData
} from './components/dashboardMetrics.js';
import { getDashboardLocale, getDashboardText } from './components/dashboardText.js';

const rows = [
  {
    date: 'Ara 2025',
    tuikMonthly: '0.89',
    tuikAnnual: '30.89',
    enagMonthly: '2.11',
    enagAnnual: '56.14',
    itoMonthly: '1.23',
    itoAnnual: '37.68'
  },
  {
    date: 'Eki 2020',
    tuikMonthly: '2.13',
    tuikAnnual: '',
    enagMonthly: '2.56',
    enagAnnual: '',
    itoMonthly: '2.45',
    itoAnnual: '12.4'
  },
  {
    date: 'Oca 2026',
    tuikMonthly: '1.10',
    tuikAnnual: '31.20',
    enagMonthly: '2.40',
    enagAnnual: '57.00',
    itoMonthly: '1.50',
    itoAnnual: '38.10'
  }
];

test('live sheet rows drive latest month, range, and averages automatically', () => {
  const { combinedData } = rowsToInflationData(rows);

  assert.equal(getLatestEntry(combinedData).date, 'Oca 2026');
  assert.equal(getSeriesRangeLabel(combinedData), 'Eki 2020 - Oca 2026');

  const averages = getPeriodAverages(combinedData, 'monthly');
  assert.equal(averages.tuik, 1.37);
  assert.equal(averages.enag, 2.36);
  assert.equal(averages.ito, 1.73);
});

test('chart data changes meaning by selected analysis mode', () => {
  const { combinedData } = rowsToInflationData(rows);

  const monthly = toChartData(combinedData, 'monthly');
  assert.deepEqual(monthly.at(-1), {
    date: 'Oca 2026',
    timestamp: monthly.at(-1).timestamp,
    tuik: 1.1,
    enag: 2.4,
    ito: 1.5
  });

  const annual = toChartData(combinedData, 'annual');
  assert.equal(annual.at(-1).tuik, 31.2);
  assert.equal(annual.at(-1).enag, 57);
  assert.equal(annual.at(-1).ito, 38.1);

  const difference = toChartData(combinedData, 'difference');
  assert.equal(difference.at(-1).enagTuik, 1.3);
  assert.equal(difference.at(-1).itoTuik, 0.4);
});

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
