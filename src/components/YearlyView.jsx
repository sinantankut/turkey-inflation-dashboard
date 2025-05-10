import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const YearlyView = ({ combinedData, dataSources = ['tuik', 'enag', 'ito'], timeframe = 'all' }) => {
  // Process data to get yearly averages
  const yearlyData = useMemo(() => {
    if (!combinedData.length) return [];
    
    // Group data by year
    const dataByYear = {};
    
    combinedData.forEach(item => {
      const year = item.date.split(' ')[1];
      
      if (!dataByYear[year]) {
        dataByYear[year] = {
          year,
          tuikValues: [],
          enagValues: [],
          itoValues: []
        };
      }
      
      if (item.tuikMonthly !== null && item.tuikMonthly !== undefined) {
        dataByYear[year].tuikValues.push(item.tuikMonthly);
      }
      
      if (item.enagMonthly !== null && item.enagMonthly !== undefined) {
        dataByYear[year].enagValues.push(item.enagMonthly);
      }
      
      if (item.itoMonthly !== null && item.itoMonthly !== undefined) {
        dataByYear[year].itoValues.push(item.itoMonthly);
      }
    });
    
    // Calculate averages
    const result = Object.values(dataByYear).map(yearData => {
      const tuikAvg = yearData.tuikValues.length > 0
        ? yearData.tuikValues.reduce((sum, val) => sum + val, 0) / yearData.tuikValues.length
        : null;
        
      const enagAvg = yearData.enagValues.length > 0
        ? yearData.enagValues.reduce((sum, val) => sum + val, 0) / yearData.enagValues.length
        : null;
        
      const itoAvg = yearData.itoValues.length > 0
        ? yearData.itoValues.reduce((sum, val) => sum + val, 0) / yearData.itoValues.length
        : null;
        
      return {
        year: yearData.year,
        tuikAvg,
        enagAvg,
        itoAvg,
        isCrisis: parseInt(yearData.year) >= 2021
      };
    }).sort((a, b) => a.year - b.year);
    
    return result;
  }, [combinedData]);
  
  // Apply timeframe filter
  const filteredData = useMemo(() => {
    if (!yearlyData.length) return [];
    
    const currentYear = new Date().getFullYear();
    
    switch(timeframe) {
      case 'recent':
        return yearlyData.filter(item => parseInt(item.year) >= currentYear - 5);
      case 'crisis':
        return yearlyData.filter(item => parseInt(item.year) >= 2021);
      case 'pre-crisis':
        return yearlyData.filter(item => parseInt(item.year) <= 2020);
      default:
        return yearlyData;
    }
  }, [yearlyData, timeframe]);
  
  // Calculate period averages for annotations
  const periodAverages = useMemo(() => {
    if (!yearlyData.length) return {};
    
    const crisisData = yearlyData.filter(item => parseInt(item.year) >= 2021);
    const preCrisisData = yearlyData.filter(item => parseInt(item.year) <= 2020);
    
    const calcAvg = (data, sourceKey) => {
      const values = data
        .map(item => item[sourceKey])
        .filter(val => val !== null && val !== undefined);
      
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : null;
    };
    
    return {
      crisis: {
        tuik: calcAvg(crisisData, 'tuikAvg'),
        enag: calcAvg(crisisData, 'enagAvg'),
        ito: calcAvg(crisisData, 'itoAvg')
      },
      preCrisis: {
        tuik: calcAvg(preCrisisData, 'tuikAvg'),
        enag: calcAvg(preCrisisData, 'enagAvg'),
        ito: calcAvg(preCrisisData, 'itoAvg')
      }
    };
  }, [yearlyData]);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value !== null && entry.value !== undefined 
                ? `${entry.value.toFixed(2)}%` 
                : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">TÜİK Kriz Dönemi Ort.</div>
          <div className="text-xl font-bold text-blue-600">
            {periodAverages.crisis.tuik !== null 
              ? `${periodAverages.crisis.tuik.toFixed(2)}%` 
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">2021-2025 Dönemi</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">TÜİK Önceki Dönem Ort.</div>
          <div className="text-xl font-bold text-blue-600">
            {periodAverages.preCrisis.tuik !== null 
              ? `${periodAverages.preCrisis.tuik.toFixed(2)}%` 
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">2020 ve öncesi</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg shadow-sm p-4 border border-orange-100">
          <div className="text-sm text-gray-600 mb-1">ENAG Kriz Dönemi Ort.</div>
          <div className="text-xl font-bold text-orange-600">
            {periodAverages.crisis.enag !== null 
              ? `${periodAverages.crisis.enag.toFixed(2)}%` 
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">2021-2025 Dönemi</div>
        </div>
        
        <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-100">
          <div className="text-sm text-gray-600 mb-1">İTO Kriz Dönemi Ort.</div>
          <div className="text-xl font-bold text-green-600">
            {periodAverages.crisis.ito !== null 
              ? `${periodAverages.crisis.ito.toFixed(2)}%` 
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">2021-2025 Dönemi</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-1">Yıllık Ortalama Enflasyon</h2>
        <p className="text-sm text-gray-500 mb-4">Her yıl için ortalama aylık enflasyon değerleri</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataSources.includes('tuik') && (
              <Bar 
                dataKey="tuikAvg" 
                name="TÜİK" 
                fill="#1e40af"
                radius={[4, 4, 0, 0]}
              />
            )}
            {dataSources.includes('enag') && (
              <Bar 
                dataKey="enagAvg" 
                name="ENAG" 
                fill="#f97316"
                radius={[4, 4, 0, 0]}
              />
            )}
            {dataSources.includes('ito') && (
              <Bar 
                dataKey="itoAvg" 
                name="İTO" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default YearlyView;