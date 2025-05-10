import React, { useMemo } from 'react';

const HeatmapView = ({ combinedData, dataSource = 'tuik', timeframe = 'all' }) => {
  // Convert combinedData into a format that's easy to use for the heatmap
  const organizedData = useMemo(() => {
    // Extract unique years
    const years = [...new Set(combinedData.map(item => {
      const date = item.date.split(' ');
      return parseInt(date[1]);
    }))].sort((a, b) => a - b);
    
    // Turkish month names
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    // Filter years based on timeframe
    let filteredYears = years;
    const currentYear = new Date().getFullYear();
    
    switch(timeframe) {
      case 'recent':
        filteredYears = years.filter(year => year >= currentYear - 5);
        break;
      case 'crisis':
        filteredYears = years.filter(year => year >= 2021 && year <= 2025);
        break;
      case 'pre-crisis':
        filteredYears = years.filter(year => year <= 2020);
        break;
      default:
        break;
    }
    
    // Organize data by year and month
    const yearData = {};
    filteredYears.forEach(year => {
      yearData[year] = Array(12).fill(null);
      
      // Find entries for this year
      combinedData.forEach(item => {
        const dateParts = item.date.split(' ');
        const itemYear = parseInt(dateParts[1]);
        
        if (itemYear === year) {
          const monthName = dateParts[0];
          const monthIndex = months.findIndex(m => m === monthName || m.substring(0, 3) === monthName);
          
          if (monthIndex !== -1) {
            const value = dataSource === 'tuik' ? item.tuikMonthly : 
                          dataSource === 'enag' ? item.enagMonthly : item.itoMonthly;
            yearData[year][monthIndex] = value;
          }
        }
      });
    });
    
    // Calculate yearly averages
    const yearlyAverages = {};
    Object.keys(yearData).forEach(year => {
      const values = yearData[year].filter(val => val !== null && val !== undefined);
      if (values.length > 0) {
        yearlyAverages[year] = values.reduce((sum, val) => sum + val, 0) / values.length;
      } else {
        yearlyAverages[year] = null;
      }
    });
    
    return {
      years: filteredYears,
      months,
      yearData,
      yearlyAverages
    };
  }, [combinedData, dataSource, timeframe]);
  
  // Find extreme values for color scaling
  const { minValue, maxValue } = useMemo(() => {
    let allValues = [];
    Object.values(organizedData.yearData).forEach(yearValues => {
      allValues = allValues.concat(yearValues.filter(val => val !== null && val !== undefined));
    });
    
    return {
      minValue: Math.min(...allValues),
      maxValue: Math.max(...allValues)
    };
  }, [organizedData]);
  
  // Get color for a cell based on value
  const getCellStyle = (value) => {
    if (value === null || value === undefined) {
      return { backgroundColor: '#f0f0f0' };
    }
    
    if (value < 0) {
      // Blue for negative (deflation)
      const intensity = Math.min(0.8, Math.abs(value) / Math.abs(minValue || 1));
      return {
        backgroundColor: `rgba(37, 99, 235, ${intensity})`,
        color: value < -1 ? 'white' : 'inherit'
      };
    } else if (value === 0) {
      // White for zero
      return { backgroundColor: 'rgba(255, 255, 255, 0)' };
    } else {
      // Red for positive (inflation)
      const intensity = Math.min(0.9, value / (maxValue / 2 || 1));
      return {
        backgroundColor: `rgba(220, 38, 38, ${intensity})`,
        color: value > 3 ? 'white' : 'inherit'
      };
    }
  };
  
  // Get average cell style
  const getAverageCellStyle = (avg) => {
    if (avg === null || avg === undefined) {
      return { backgroundColor: '#f0f0f0' };
    }
    
    if (avg <= 1) {
      return { backgroundColor: 'rgba(37, 99, 235, 0.2)' };
    } else if (avg <= 2) {
      return { backgroundColor: 'rgba(252, 211, 77, 0.3)' };
    } else {
      const intensity = Math.min(0.8, avg / 5);
      return {
        backgroundColor: `rgba(220, 38, 38, ${intensity})`,
        color: avg > 3 ? 'white' : 'inherit'
      };
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10 bg-gray-50">
              Yıl
            </th>
            {organizedData.months.map((month, index) => (
              <th key={month} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {month}
              </th>
            ))}
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ort.
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {organizedData.years.map((year) => (
            <tr key={year} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 z-10 bg-gray-50">
                {year}
              </td>
              {organizedData.yearData[year].map((value, monthIndex) => (
                <td 
                  key={`${year}-${monthIndex}`} 
                  className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-center"
                  style={getCellStyle(value)}
                >
                  {value !== null && value !== undefined ? `${value.toFixed(2)}%` : '-'}
                </td>
              ))}
              <td 
                className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 text-center"
                style={getAverageCellStyle(organizedData.yearlyAverages[year])}
              >
                {organizedData.yearlyAverages[year] !== null && organizedData.yearlyAverages[year] !== undefined
                  ? `${organizedData.yearlyAverages[year].toFixed(2)}%` 
                  : '-'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HeatmapView;