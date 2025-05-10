import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp, Calendar, BarChart2, PieChart, Filter } from 'lucide-react';
import StatCard from './StatCard';
import TimeframeSelector from './TimeframeSelector';
import ComparisonToggle from './ComparisonToggle';
import HeatmapView from './HeatmapView';
import YearlyView from './YearlyView';
import EnhancedStats from './EnhancedStats';
import ViewToggle from './ViewToggle';
import PeriodSelector from './PeriodSelector';
import DataSourceSelector from './DataSourceSelector';
import MonthlyComparisonChart from './MonthlyComparisonChart';

const InflationDashboard = ({ itoData, tuikData, enagData }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1y'); // Options: '6m', '1y', '2y', '5y', 'all'
  const [comparisonMode, setComparisonMode] = useState('yoy'); // Options: 'mom', 'yoy'
  const [activeView, setActiveView] = useState('line'); // Options: 'line', 'heatmap', 'yearly'
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // Options: 'all', 'recent', 'crisis', 'pre-crisis'
  const [activeDataSource, setActiveDataSource] = useState('tuik'); // Options: 'tuik', 'enag', 'ito'
  const [combinedData, setCombinedData] = useState([]);
  
  // Process and combine data when source data changes
  useEffect(() => {
    if (itoData && tuikData && enagData) {
      const combined = processAndCombineData(itoData, tuikData.data, enagData.data);
      setCombinedData(combined);
    }
  }, [itoData, tuikData, enagData]);
  
  // Function to process and combine data
  const processAndCombineData = (ito, tuik, enag) => {
    // This processes data from all three sources and aligns them by date
    const combined = [];
    
    // Use the tuik data as base since it has a simpler structure
    tuik.forEach((item, index) => {
      if (index < enag.length) {
        const date = item.Date;
        const yearMonth = date.split(' ');
        const year = parseInt(yearMonth[1], 10);
        
        // Find matching ITO data
        const matchingIto = ito.find(i => 
          i.year === year && convertTurkishMonthToIndex(i.month) === convertTurkishMonthToIndex(yearMonth[0])
        );
        
        combined.push({
          date: date,
          timestamp: new Date(`${yearMonth[1]}-${convertTurkishMonthToIndex(yearMonth[0]) + 1}-01`).getTime(),
          tuikMonthly: item["TÜİK Monthly (%)"] || null,
          tuikAnnual: item["TÜİK Annualized (%)"] || null,
          enagMonthly: enag[index]["ENAG Monthly (%)"] || null,
          enagAnnual: enag[index]["ENAG Annualized (%)"] || null,
          itoMonthly: matchingIto ? matchingIto.cpi_wage_earners.mom_change_pct : null,
          itoAnnual: matchingIto ? matchingIto.cpi_wage_earners.yoy_change_pct : null
        });
      }
    });
    
    return combined;
  };
  
  // Helper function to convert Turkish month names to index (0-11)
  const convertTurkishMonthToIndex = (turkishMonth) => {
    const months = {
      'Oca': 0, 'Şub': 1, 'Mar': 2, 'Nis': 3, 'May': 4, 'Haz': 5,
      'Tem': 6, 'Ağu': 7, 'Eyl': 8, 'Eki': 9, 'Kas': 10, 'Ara': 11,
      'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
      'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
    };
    return months[turkishMonth] || 0;
  };

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (!combinedData.length) return [];
    
    const now = new Date();
    let filterDate = new Date();
    
    switch(selectedTimeframe) {
      case '6m':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case '2y':
        filterDate.setFullYear(now.getFullYear() - 2);
        break;
      case '5y':
        filterDate.setFullYear(now.getFullYear() - 5);
        break;
      default:
        // 'all' - return all data
        return combinedData;
    }
    
    const timestamp = filterDate.getTime();
    return combinedData.filter(item => item.timestamp >= timestamp);
  }, [combinedData, selectedTimeframe]);

  // Get the latest inflation figures
  const latestFigures = useMemo(() => {
    if (!combinedData.length) return { tuik: null, enag: null, ito: null };
    
    const latest = combinedData[combinedData.length - 1];
    return {
      tuik: comparisonMode === 'yoy' ? latest.tuikAnnual : latest.tuikMonthly,
      enag: comparisonMode === 'yoy' ? latest.enagAnnual : latest.enagMonthly,
      ito: comparisonMode === 'yoy' ? latest.itoAnnual : latest.itoMonthly
    };
  }, [combinedData, comparisonMode]);
  
  // Calculate the trend (up or down) compared to previous period
  const trends = useMemo(() => {
    if (combinedData.length < 2) return { tuik: 0, enag: 0, ito: 0 };
    
    const latest = combinedData[combinedData.length - 1];
    const previous = combinedData[combinedData.length - 2];
    
    return {
      tuik: comparisonMode === 'yoy' 
        ? (latest.tuikAnnual - previous.tuikAnnual) 
        : (latest.tuikMonthly - previous.tuikMonthly),
      enag: comparisonMode === 'yoy' 
        ? (latest.enagAnnual - previous.enagAnnual) 
        : (latest.enagMonthly - previous.enagMonthly),
      ito: comparisonMode === 'yoy' 
        ? (latest.itoAnnual - previous.itoAnnual) 
        : (latest.itoMonthly - previous.itoMonthly)
    };
  }, [combinedData, comparisonMode]);

  // Format date for display (e.g., "Apr 2023")
  const formatDate = (date) => {
    if (!date) return '';
    const parts = date.split(' ');
    return `${parts[0]} ${parts[1]}`;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value !== null && entry.value !== undefined ? `${entry.value.toFixed(2)}%` : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" size={24} />
            Türkiye Enflasyon Gösterge Paneli
          </h1>
          <p className="text-gray-600 mt-1">TÜİK, ENAG ve İTO enflasyon ölçümlerinin karşılaştırmalı analizi</p>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center">
            <Calendar size={18} className="text-gray-400 mr-2" />
            <span className="text-gray-600 text-sm">
              Son Güncelleme: {filteredData.length ? formatDate(filteredData[filteredData.length - 1].date) : ''}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <ViewToggle 
              activeView={activeView}
              setActiveView={setActiveView}
            />
            {activeView === 'line' && (
              <ComparisonToggle
                comparisonMode={comparisonMode}
                setComparisonMode={setComparisonMode}
              />
            )}
            {activeView !== 'heatmap' && (
              <TimeframeSelector
                selectedTimeframe={selectedTimeframe}
                setSelectedTimeframe={setSelectedTimeframe}
              />
            )}
            {(activeView === 'heatmap' || activeView === 'yearly') && (
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
              />
            )}
          </div>
        </div>
        
        {activeView === 'line' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard 
                title="TÜİK Enflasyon" 
                value={latestFigures.tuik} 
                trend={trends.tuik}
                color="blue" 
                icon={<TrendingUp size={16} />}
              />
              <StatCard 
                title="ENAG Enflasyon" 
                value={latestFigures.enag} 
                trend={trends.enag}
                color="orange" 
                icon={<TrendingUp size={16} />}
              />
              <StatCard 
                title="İTO Enflasyon" 
                value={latestFigures.ito} 
                trend={trends.ito}
                color="green" 
                icon={<TrendingUp size={16} />}
              />
            </div>
            
            {/* Main Monthly Comparison Chart - Added as the first visualization */}
            <MonthlyComparisonChart combinedData={combinedData} />
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart2 size={18} className="mr-2 text-gray-400" />
                {comparisonMode === 'yoy' ? 'Yıllık Enflasyon Oranları Karşılaştırması' : 'Aylık Enflasyon Oranları Karşılaştırması'}
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={filteredData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate} 
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`} 
                    stroke="#9ca3af"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={comparisonMode === 'yoy' ? 'tuikAnnual' : 'tuikMonthly'}
                    name="TÜİK"
                    stroke="#1e40af"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    dot={{ r: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={comparisonMode === 'yoy' ? 'enagAnnual' : 'enagMonthly'}
                    name="ENAG"
                    stroke="#f97316"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    dot={{ r: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={comparisonMode === 'yoy' ? 'itoAnnual' : 'itoMonthly'}
                    name="İTO"
                    stroke="#10b981"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    dot={{ r: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Filter size={18} className="mr-2 text-gray-400" />
                  TÜİK ve ENAG Farkı
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={filteredData.map(item => ({
                      ...item,
                      differential: comparisonMode === 'yoy' 
                        ? (item.enagAnnual - item.tuikAnnual)
                        : (item.enagMonthly - item.tuikMonthly)
                    }))}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`} 
                      stroke="#9ca3af"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="differential"
                      name="ENAG-TÜİK Farkı"
                      fill="#f97316"
                      stroke="#f97316"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart2 size={18} className="mr-2 text-gray-400" />
                  Aylık Enflasyon Karşılaştırması
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={filteredData.slice(-12)} // Last 12 months
                    margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                      height={50}
                      stroke="#9ca3af"
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`}
                      stroke="#9ca3af"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ paddingTop: 10 }}
                    />
                    <Bar dataKey="tuikMonthly" name="TÜİK" fill="#1e40af" barSize={10} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="enagMonthly" name="ENAG" fill="#f97316" barSize={10} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="itoMonthly" name="İTO" fill="#10b981" barSize={10} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <PieChart size={18} className="mr-2 text-gray-400" />
                Aylık Veriler (Son 12 Ay)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TÜİK Aylık</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TÜİK Yıllık</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ENAG Aylık</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ENAG Yıllık</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İTO Aylık</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İTO Yıllık</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.slice(-12).map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(item.date)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.tuikMonthly !== null ? `${item.tuikMonthly.toFixed(2)}%` : 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.tuikAnnual !== null ? `${item.tuikAnnual.toFixed(2)}%` : 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.enagMonthly !== null ? `${item.enagMonthly.toFixed(2)}%` : 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.enagAnnual !== null ? `${item.enagAnnual.toFixed(2)}%` : 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.itoMonthly !== null ? `${item.itoMonthly.toFixed(2)}%` : 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{item.itoAnnual !== null ? `${item.itoAnnual.toFixed(2)}%` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {activeView === 'heatmap' && (
          <div className="mb-6">
            <DataSourceSelector 
              activeDataSource={activeDataSource}
              setActiveDataSource={setActiveDataSource}
            />
          </div>
        )}
        
        {activeView === 'yearly' && (
          <EnhancedStats 
            combinedData={combinedData}
            dataSource={activeDataSource}
          />
        )}
        
        {activeView === 'heatmap' && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Filter size={18} className="mr-2 text-gray-400" />
              {activeDataSource === 'tuik' ? 'TÜİK' : activeDataSource === 'enag' ? 'ENAG' : 'İTO'} Aylık Enflasyon Isı Haritası
            </h2>
            <HeatmapView 
              combinedData={combinedData}
              dataSource={activeDataSource}
              timeframe={selectedPeriod}
            />
          </div>
        )}
        
        {activeView === 'yearly' && (
          <YearlyView 
            combinedData={combinedData}
            dataSources={['tuik', 'enag', 'ito']}
            timeframe={selectedPeriod}
          />
        )}
        
        <div className="text-center text-gray-500 text-sm mb-8 p-2">
          <p>Veri Kaynakları: TÜİK (Türkiye İstatistik Kurumu), ENAG (Enflasyon Araştırma Grubu) ve İTO (İstanbul Ticaret Odası)</p>
          <p className="mt-1">Son Güncelleme: {filteredData.length ? formatDate(filteredData[filteredData.length - 1].date) : ''}</p>
          
          <div className="mt-4 mx-auto max-w-3xl px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-left text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Notlar:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Veriler aylık enflasyon oranlarını göstermektedir (bir önceki aya göre % değişim).</li>
              <li>2021 Aralık ayında başlayan ve 2022-2023 döneminde devam eden yüksek değerler, Türkiye'nin yakın dönem ekonomik krizini göstermektedir.</li>
              <li>TÜİK, ENAG ve İTO arasındaki farklar, farklı hesaplama metodolojilerinden ve ölçüm yöntemlerinden kaynaklanmaktadır.</li>
              <li>Heatmap (ısı haritası) görünümünde, mavi renkli hücreler deflasyonu (fiyatlarda düşüş), kırmızı renkli hücreler enflasyonu (fiyatlarda artış) gösterir.</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
            © {new Date().getFullYear()} Sinan Tankut Gülhan. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InflationDashboard;