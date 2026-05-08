const SOURCE_KEYS = ['tuik', 'enag', 'ito'];

export const SOURCE_META = {
  tuik: { label: 'TÜİK', color: '#1d4ed8', textClass: 'text-blue-700', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' },
  enag: { label: 'ENAG', color: '#ea580c', textClass: 'text-orange-700', bgClass: 'bg-orange-50', borderClass: 'border-orange-200' },
  ito: { label: 'İTO', color: '#059669', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200' }
};

export const DIFFERENCE_META = {
  enagTuik: { label: 'ENAG - TÜİK', color: '#c2410c', textClass: 'text-orange-700', bgClass: 'bg-orange-50', borderClass: 'border-orange-200' },
  itoTuik: { label: 'İTO - TÜİK', color: '#047857', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200' },
  enagIto: { label: 'ENAG - İTO', color: '#7c3aed', textClass: 'text-violet-700', bgClass: 'bg-violet-50', borderClass: 'border-violet-200' }
};

export const MODE_META = {
  monthly: {
    label: 'Aylık',
    title: 'Aylık karşılaştırma',
    description: 'Bir önceki aya göre değişim',
    unitLabel: 'aylık'
  },
  annual: {
    label: 'Yıllık',
    title: 'Yıllık karşılaştırma',
    description: '12 aylık değişim oranı',
    unitLabel: 'yıllık'
  },
  difference: {
    label: 'Fark',
    title: 'Kaynak farkı',
    description: 'Kaynaklar arasındaki puan farkı',
    unitLabel: 'puan farkı'
  }
};

export function getSortedData(data) {
  return [...(data ?? [])].sort((left, right) => left.timestamp - right.timestamp);
}

export function getLatestEntry(data) {
  return getSortedData(data).at(-1) ?? null;
}

export function getPreviousEntry(data) {
  return getSortedData(data).at(-2) ?? null;
}

export function getSeriesRangeLabel(data) {
  const sorted = getSortedData(data);
  if (!sorted.length) return '';
  return `${sorted[0].date} - ${sorted.at(-1).date}`;
}

export function toChartData(data, mode) {
  return getSortedData(data).map((item) => {
    if (mode === 'difference') {
      return {
        date: item.date,
        timestamp: item.timestamp,
        enagTuik: subtract(item.enagMonthly, item.tuikMonthly),
        itoTuik: subtract(item.itoMonthly, item.tuikMonthly),
        enagIto: subtract(item.enagMonthly, item.itoMonthly)
      };
    }

    const suffix = mode === 'annual' ? 'Annual' : 'Monthly';
    return {
      date: item.date,
      timestamp: item.timestamp,
      tuik: item[`tuik${suffix}`],
      enag: item[`enag${suffix}`],
      ito: item[`ito${suffix}`]
    };
  });
}

export function getPeriodAverages(data, mode) {
  const chartData = toChartData(data, mode);
  const keys = mode === 'difference' ? Object.keys(DIFFERENCE_META) : SOURCE_KEYS;

  return keys.reduce((averages, key) => {
    averages[key] = roundMetric(average(chartData.map((item) => item[key])));
    return averages;
  }, {});
}

export function getLatestValues(data, mode) {
  const latest = toChartData(data, mode).at(-1);
  if (!latest) return {};

  const keys = mode === 'difference' ? Object.keys(DIFFERENCE_META) : SOURCE_KEYS;
  return keys.reduce((values, key) => {
    values[key] = latest[key];
    return values;
  }, {});
}

export function getPreviousDeltas(data, mode) {
  const chartData = toChartData(data, mode);
  const latest = chartData.at(-1);
  const previous = chartData.at(-2);
  const keys = mode === 'difference' ? Object.keys(DIFFERENCE_META) : SOURCE_KEYS;

  return keys.reduce((deltas, key) => {
    deltas[key] = latest && previous ? subtract(latest[key], previous[key]) : null;
    return deltas;
  }, {});
}

export function getMetricMeta(mode) {
  return mode === 'difference' ? DIFFERENCE_META : SOURCE_META;
}

export function formatPercent(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : 'N/A';
}

export function formatPoints(value, units = { points: 'puan' }) {
  if (!Number.isFinite(value)) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} ${units.points}`;
}

export function formatMetric(value, mode, units) {
  return mode === 'difference' ? formatPoints(value, units) : formatPercent(value);
}

function average(values) {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (!validValues.length) return null;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function subtract(left, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  return roundMetric(left - right);
}

function roundMetric(value) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : null;
}
