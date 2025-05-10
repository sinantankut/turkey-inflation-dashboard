import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ReferenceLine 
} from 'recharts';

const MonthlyComparisonChart = ({ combinedData }) => {
  // Filter data starting from October 2020
  const filteredData = useMemo(() => {
    if (!combinedData.length) return [];
    
    const startDate = new Date('2020-10-01').getTime();
    return combinedData.filter(item => item.timestamp >= startDate);
  }, [combinedData]);
  
  // Calculate maximum value for Y-axis scaling
  const maxValue = useMemo(() => {
    if (!filteredData.length) return 20;
    
    const allMonthlyValues = filteredData.flatMap(item => [
      item.tuikMonthly || 0,
      item.enagMonthly || 0,
      item.itoMonthly || 0
    ]);
    
    return Math.ceil(Math.max(...allMonthlyValues) * 1.1); // Add 10% margin
  }, [filteredData]);
  
  // Find months with significant events for reference lines
  const significantMonths = useMemo(() => {
    if (!filteredData.length) return [];
    
    return filteredData
      .filter(item => {
        // December 2021 (significant inflation jump)
        if (item.date.includes('Ara 2021')) return true;
        // July 2023 (another spike)
        if (item.date.includes('Tem 2023')) return true;
        return false;
      })
      .map(item => ({
        date: item.date,
        timestamp: item.timestamp
      }));
  }, [filteredData]);
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const parts = date.split(' ');
    return `${parts[0]} ${parts[1]}`;
  };
  
  // Format for the X-axis to show only every 3 months
  const formatXAxis = (date) => {
    if (!date) return '';
    
    // Get the index of this date in the array
    const index = filteredData.findIndex(item => item.date === date);
    
    // Show only every 3 months
    if (index % 3 === 0) {
      const parts = date.split(' ');
      return `${parts[0]} ${parts[1]}`;
    }
    return '';
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = formatDate(label);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{date}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center mb-1">
              <span style={{ color: entry.color }} className="font-medium mr-3">
                {entry.name}:
              </span>
              <span className="text-gray-900">
                {entry.value !== null && entry.value !== undefined 
                  ? `${entry.value.toFixed(2)}%` 
                  : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="flex justify-center items-center space-x-6 mt-2">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-2">Aylık Enflasyon Oranları (2020-2025)</h2>
      <p className="text-sm text-gray-500 mb-4">
        TÜİK, ENAG ve İTO kaynaklarından aylık enflasyon verileri karşılaştırması
      </p>
      
      <ResponsiveContainer width="100%" height={450}>
        <LineChart
          data={filteredData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            tick={{ fontSize: 11 }}
            minTickGap={30}
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#9ca3af"
          />
          <YAxis 
            domain={[0, maxValue]}
            tickFormatter={(value) => `${value}%`}
            stroke="#9ca3af"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          
          {/* Reference lines for significant events */}
          {significantMonths.map((month, index) => (
            <ReferenceLine 
              key={index}
              x={month.date}
              stroke="#888"
              strokeDasharray="3 3"
              label={{
                value: formatDate(month.date),
                position: 'insideTopRight',
                fontSize: 10,
                fill: '#666'
              }}
            />
          ))}
          
          <Line
            type="monotone"
            dataKey="tuikMonthly"
            name="TÜİK"
            stroke="#1e40af"
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="enagMonthly"
            name="ENAG"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="itoMonthly"
            name="İTO"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <span className="font-medium">Not:</span> Grafikte 2020 Ekim ayından itibaren tüm aylık enflasyon verileri gösterilmektedir. 
          Dikey kesikli çizgiler, Aralık 2021 ve Temmuz 2023 gibi önemli enflasyon sıçramalarını göstermektedir.
        </p>
      </div>
    </div>
  );
};

export default MonthlyComparisonChart;