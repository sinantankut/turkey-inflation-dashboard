import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { BarChart3, CalendarDays, TrendingUp } from 'lucide-react';
import {
  DIFFERENCE_META,
  MODE_META,
  formatMetric,
  getLatestEntry,
  getLatestValues,
  getMetricMeta,
  getPeriodAverages,
  getPreviousDeltas,
  getSeriesRangeLabel,
  toChartData
} from './dashboardMetrics';

const REFERENCE_LEVELS = [3, 5, 10, 20];

const InflationDashboard = ({ itoData, tuikData, enagData, sourceCombinedData }) => {
  const [analysisMode, setAnalysisMode] = useState('monthly');
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    if (sourceCombinedData?.length) {
      setCombinedData(sourceCombinedData);
      return;
    }

    if (itoData && tuikData && enagData) {
      setCombinedData(processAndCombineData(itoData, tuikData.data, enagData.data));
    }
  }, [itoData, tuikData, enagData, sourceCombinedData]);

  const latest = useMemo(() => getLatestEntry(combinedData), [combinedData]);
  const rangeLabel = useMemo(() => getSeriesRangeLabel(combinedData), [combinedData]);
  const chartData = useMemo(() => toChartData(combinedData, analysisMode), [combinedData, analysisMode]);
  const averages = useMemo(() => getPeriodAverages(combinedData, analysisMode), [combinedData, analysisMode]);
  const latestValues = useMemo(() => getLatestValues(combinedData, analysisMode), [combinedData, analysisMode]);
  const deltas = useMemo(() => getPreviousDeltas(combinedData, analysisMode), [combinedData, analysisMode]);
  const metricMeta = getMetricMeta(analysisMode);
  const visibleKeys = Object.keys(metricMeta);
  const chartTitle = MODE_META[analysisMode].title;
  const chartDescription = MODE_META[analysisMode].description;

  const yAxisTicks = useMemo(() => {
    const values = chartData.flatMap((item) => visibleKeys.map((key) => item[key]).filter(Number.isFinite));
    const maxValue = Math.max(20, ...values);
    const upper = Math.ceil(maxValue / 10) * 10;
    return Array.from(new Set([0, ...REFERENCE_LEVELS, upper])).sort((left, right) => left - right);
  }, [chartData, visibleKeys]);

  const yDomain = useMemo(() => {
    if (analysisMode === 'difference') return ['auto', 'auto'];
    return [0, Math.max(...yAxisTicks)];
  }, [analysisMode, yAxisTicks]);

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <CalendarDays size={14} />
                Son veri: {latest?.date ?? 'N/A'}
              </div>
              <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                Türkiye Enflasyon Gösterge Paneli
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                TÜİK, ENAG ve İTO enflasyon serilerinin karşılaştırmalı görünümü.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Dönem:</span> {rangeLabel}
            </div>
          </div>
        </header>

        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {visibleKeys.map((key) => (
            <MetricCard
              key={key}
              meta={metricMeta[key]}
              latestDate={latest?.date}
              latestValue={latestValues[key]}
              averageValue={averages[key]}
              delta={deltas[key]}
              mode={analysisMode}
            />
          ))}
        </section>

        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
          <div className="mb-4 grid grid-cols-3 rounded-xl bg-slate-100 p-1 text-center text-sm font-bold text-slate-600">
            {Object.entries(MODE_META).map(([mode, meta]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAnalysisMode(mode)}
                className={`rounded-lg px-2 py-2 transition-colors ${
                  analysisMode === mode
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'hover:bg-slate-200/70'
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>

          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                <BarChart3 size={18} />
                {chartTitle}
              </h2>
              <p className="text-sm text-slate-500">{chartDescription} · {rangeLabel}</p>
            </div>
          </div>

          <div className="h-[330px] sm:h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 18, bottom: 36, left: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  minTickGap={28}
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={formatAxisDate}
                  height={58}
                  stroke="#cbd5e1"
                />
                <YAxis
                  domain={yDomain}
                  ticks={yAxisTicks}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => analysisMode === 'difference' ? `${value}` : `${value}%`}
                  stroke="#cbd5e1"
                  width={42}
                />
                <Tooltip content={<ChartTooltip mode={analysisMode} metricMeta={metricMeta} />} cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
                {REFERENCE_LEVELS.map((level) => (
                  <ReferenceLine
                    key={level}
                    y={level}
                    stroke="#cbd5e1"
                    strokeDasharray={level === 20 ? '0' : '4 4'}
                    label={{ value: `${level}${analysisMode === 'difference' ? '' : '%'}`, fill: '#64748b', fontSize: 11, position: 'insideLeft' }}
                  />
                ))}
                {visibleKeys.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={metricMeta[key].label}
                    stroke={metricMeta[key].color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <RecentTable data={combinedData} />
          <DifferenceSummary data={combinedData} />
        </section>

        <footer className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm sm:p-5">
          <p>
            Veri kaynakları: TÜİK ve İTO verileri kurumların yayımladığı serilerden; ENAG verileri ENAG'ın kamuya açık duyurularından derlenmiştir.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Sinan Tankut Gülhan. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </main>
  );
};

const MetricCard = ({ meta, latestDate, latestValue, averageValue, delta, mode }) => (
  <article className={`rounded-2xl border ${meta.borderClass} ${meta.bgClass} p-4 shadow-sm`}>
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-black text-slate-700">{meta.label}</h3>
      <TrendingUp className={meta.textClass} size={16} />
    </div>
    <div className={`mt-3 text-3xl font-black ${meta.textClass}`}>{formatMetric(latestValue, mode)}</div>
    <div className="mt-1 text-xs text-slate-500">{latestDate ?? 'N/A'}</div>
    <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/70 pt-3">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Dönem ort.</div>
        <div className="mt-1 text-sm font-black text-slate-900">{formatMetric(averageValue, mode)}</div>
      </div>
      <div className={`text-right text-xs font-bold ${Number.isFinite(delta) && delta > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
        {Number.isFinite(delta) ? formatMetric(delta, 'difference') : 'N/A'}
      </div>
    </div>
  </article>
);

const ChartTooltip = ({ active, payload, label, mode, metricMeta }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl">
      <div className="mb-2 text-sm font-black text-slate-950">{label}</div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex min-w-36 items-center justify-between gap-4 text-sm">
            <span className="font-bold" style={{ color: metricMeta[entry.dataKey]?.color }}>
              {metricMeta[entry.dataKey]?.label ?? entry.name}
            </span>
            <span className="text-slate-900">{formatMetric(entry.value, mode)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecentTable = ({ data }) => {
  const rows = useMemo(() => [...data].sort((left, right) => left.timestamp - right.timestamp).slice(-12).reverse(), [data]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Son 12 ay</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-3">Ay</th>
              <th className="px-3 py-2">TÜİK</th>
              <th className="px-3 py-2">ENAG</th>
              <th className="px-3 py-2">İTO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.date}>
                <td className="py-2 pr-3 font-bold text-slate-900">{row.date}</td>
                <td className="px-3 py-2 text-blue-700">{formatMetric(row.tuikMonthly, 'monthly')}</td>
                <td className="px-3 py-2 text-orange-700">{formatMetric(row.enagMonthly, 'monthly')}</td>
                <td className="px-3 py-2 text-emerald-700">{formatMetric(row.itoMonthly, 'monthly')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const DifferenceSummary = ({ data }) => {
  const averages = useMemo(() => getPeriodAverages(data, 'difference'), [data]);
  const latestValues = useMemo(() => getLatestValues(data, 'difference'), [data]);
  const latest = useMemo(() => getLatestEntry(data), [data]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Kaynak farkı</h2>
      <p className="mt-1 text-sm text-slate-500">{latest?.date ?? 'Son ay'} ve dönem ortalaması</p>
      <div className="mt-4 space-y-3">
        {Object.entries(DIFFERENCE_META).map(([key, meta]) => (
          <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-slate-800">{meta.label}</span>
              <span className={`font-black ${meta.textClass}`}>{formatMetric(latestValues[key], 'difference')}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">Dönem ort.: {formatMetric(averages[key], 'difference')}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const processAndCombineData = (ito, tuik, enag) => {
  const combined = [];
  const enagByDate = new Map(enag.map((item) => [item.Date, item]));

  tuik.forEach((item) => {
    const matchingEnag = enagByDate.get(item.Date);
    if (!matchingEnag) return;

    const [month, yearValue] = item.Date.split(' ');
    const year = Number.parseInt(yearValue, 10);
    const monthIndex = convertTurkishMonthToIndex(month);
    const matchingIto = ito.find((itoItem) => (
      itoItem.year === year && convertTurkishMonthToIndex(itoItem.month) === monthIndex
    ));

    combined.push({
      date: item.Date,
      timestamp: new Date(year, monthIndex, 1).getTime(),
      tuikMonthly: item['TÜİK Monthly (%)'] ?? null,
      tuikAnnual: item['TÜİK Annualized (%)'] ?? null,
      enagMonthly: matchingEnag['ENAG Monthly (%)'] ?? null,
      enagAnnual: matchingEnag['ENAG Annualized (%)'] ?? null,
      itoMonthly: matchingIto ? matchingIto.cpi_wage_earners.mom_change_pct : null,
      itoAnnual: matchingIto ? matchingIto.cpi_wage_earners.yoy_change_pct : null
    });
  });

  return combined.sort((left, right) => left.timestamp - right.timestamp);
};

const convertTurkishMonthToIndex = (turkishMonth) => {
  const months = {
    Oca: 0, Şub: 1, Mar: 2, Nis: 3, May: 4, Haz: 5,
    Tem: 6, Ağu: 7, Eyl: 8, Eki: 9, Kas: 10, Ara: 11,
    Ocak: 0, Şubat: 1, Mart: 2, Nisan: 3, Mayıs: 4, Haziran: 5,
    Temmuz: 6, Ağustos: 7, Eylül: 8, Ekim: 9, Kasım: 10, Aralık: 11
  };
  return months[turkishMonth] ?? 0;
};

const formatAxisDate = (date) => {
  const [month, year] = date.split(' ');
  return month === 'Oca' || month === 'Eki' ? `${month} ${year}` : year;
};

export default InflationDashboard;
