import React, { useMemo } from 'react';
import { TrendingUp, ArrowDown, ArrowUp, AlertTriangle, Clock } from 'lucide-react';

const EnhancedStats = ({ combinedData, dataSource = 'tuik' }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!combinedData.length) return {
      highest: null,
      lowest: null,
      crisisAvg: null,
      preCrisisAvg: null
    };
    
    // Get monthly values based on selected data source
    const getMonthlyValue = (item) => {
      switch(dataSource) {
        case 'enag':
          return item.enagMonthly;
        case 'ito':
          return item.itoMonthly;
        default:
          return item.tuikMonthly;
      }
    };
    
    // Filter out null/undefined values
    const validEntries = combinedData
      .map(item => ({
        value: getMonthlyValue(item),
        date: item.date
      }))
      .filter(item => item.value !== null && item.value !== undefined);
    
    if (!validEntries.length) return {
      highest: null,
      lowest: null,
      crisisAvg: null,
      preCrisisAvg: null
    };
    
    // Find highest and lowest values
    const highest = validEntries.reduce(
      (max, item) => item.value > max.value ? item : max, 
      validEntries[0]
    );
    
    const lowest = validEntries.reduce(
      (min, item) => item.value < min.value ? item : min, 
      validEntries[0]
    );
    
    // Split data into crisis and pre-crisis periods
    const crisisData = validEntries.filter(item => {
      const year = parseInt(item.date.split(' ')[1]);
      return year >= 2021;
    });
    
    const preCrisisData = validEntries.filter(item => {
      const year = parseInt(item.date.split(' ')[1]);
      return year <= 2020;
    });
    
    // Calculate averages
    const crisisAvg = crisisData.length
      ? crisisData.reduce((sum, item) => sum + item.value, 0) / crisisData.length
      : null;
      
    const preCrisisAvg = preCrisisData.length
      ? preCrisisData.reduce((sum, item) => sum + item.value, 0) / preCrisisData.length
      : null;
      
    return {
      highest,
      lowest,
      crisisAvg,
      crisisAvgDelta: crisisAvg !== null && preCrisisAvg !== null ? crisisAvg - preCrisisAvg : null,
      preCrisisAvg
    };
  }, [combinedData, dataSource]);
  
  // Get Turkishified month name
  const getTurkishMonth = (date) => {
    if (!date) return '-';
    const parts = date.split(' ');
    return parts[0] + ' ' + parts[1];
  };
  
  // Get color classes based on data source
  const getColorClasses = () => {
    switch(dataSource) {
      case 'enag':
        return {
          bgHighest: 'bg-orange-50',
          textHighest: 'text-orange-600',
          borderHighest: 'border-orange-100',
          iconHighest: 'text-orange-500',
          bgLowest: 'bg-orange-50',
          textLowest: 'text-orange-600',
          borderLowest: 'border-orange-100',
          iconLowest: 'text-orange-500',
          bgCrisis: 'bg-orange-50',
          textCrisis: 'text-orange-600',
          borderCrisis: 'border-orange-100',
          iconCrisis: 'text-orange-500',
          bgPreCrisis: 'bg-orange-50',
          textPreCrisis: 'text-orange-600',
          borderPreCrisis: 'border-orange-100',
          iconPreCrisis: 'text-orange-500',
        };
      case 'ito':
        return {
          bgHighest: 'bg-green-50',
          textHighest: 'text-green-600',
          borderHighest: 'border-green-100',
          iconHighest: 'text-green-500',
          bgLowest: 'bg-green-50',
          textLowest: 'text-green-600',
          borderLowest: 'border-green-100',
          iconLowest: 'text-green-500',
          bgCrisis: 'bg-green-50',
          textCrisis: 'text-green-600',
          borderCrisis: 'border-green-100',
          iconCrisis: 'text-green-500',
          bgPreCrisis: 'bg-green-50',
          textPreCrisis: 'text-green-600',
          borderPreCrisis: 'border-green-100',
          iconPreCrisis: 'text-green-500',
        };
      default:
        return {
          bgHighest: 'bg-blue-50',
          textHighest: 'text-blue-600',
          borderHighest: 'border-blue-100',
          iconHighest: 'text-blue-500',
          bgLowest: 'bg-blue-50',
          textLowest: 'text-blue-600',
          borderLowest: 'border-blue-100',
          iconLowest: 'text-blue-500',
          bgCrisis: 'bg-blue-50',
          textCrisis: 'text-blue-600',
          borderCrisis: 'border-blue-100',
          iconCrisis: 'text-blue-500',
          bgPreCrisis: 'bg-blue-50',
          textPreCrisis: 'text-blue-600',
          borderPreCrisis: 'border-blue-100',
          iconPreCrisis: 'text-blue-500',
        };
    }
  };
  
  const colors = getColorClasses();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className={`${colors.bgHighest} rounded-lg shadow-sm p-4 border ${colors.borderHighest}`}>
        <div className="text-sm text-gray-600 mb-1 flex items-center">
          <ArrowUp size={14} className={`mr-1 ${colors.iconHighest}`} />
          En Yüksek Aylık
        </div>
        <div className={`text-xl font-bold ${colors.textHighest}`}>
          {stats.highest ? `${stats.highest.value.toFixed(2)}%` : 'N/A'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.highest ? getTurkishMonth(stats.highest.date) : '-'}
        </div>
      </div>
      
      <div className={`${colors.bgLowest} rounded-lg shadow-sm p-4 border ${colors.borderLowest}`}>
        <div className="text-sm text-gray-600 mb-1 flex items-center">
          <ArrowDown size={14} className={`mr-1 ${colors.iconLowest}`} />
          En Düşük Aylık
        </div>
        <div className={`text-xl font-bold ${colors.textLowest}`}>
          {stats.lowest ? `${stats.lowest.value.toFixed(2)}%` : 'N/A'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.lowest ? getTurkishMonth(stats.lowest.date) : '-'}
        </div>
      </div>
      
      <div className={`${colors.bgCrisis} rounded-lg shadow-sm p-4 border ${colors.borderCrisis}`}>
        <div className="text-sm text-gray-600 mb-1 flex items-center">
          <AlertTriangle size={14} className={`mr-1 ${colors.iconCrisis}`} />
          Kriz Dönemi Ort.
        </div>
        <div className={`text-xl font-bold ${colors.textCrisis}`}>
          {stats.crisisAvg !== null ? `${stats.crisisAvg.toFixed(2)}%` : 'N/A'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          2021-2025 Dönemi
          {stats.crisisAvgDelta !== null && (
            <span className="text-xs ml-1 text-red-500">
              ({stats.crisisAvgDelta > 0 ? '+' : ''}{stats.crisisAvgDelta.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>
      
      <div className={`${colors.bgPreCrisis} rounded-lg shadow-sm p-4 border ${colors.borderPreCrisis}`}>
        <div className="text-sm text-gray-600 mb-1 flex items-center">
          <Clock size={14} className={`mr-1 ${colors.iconPreCrisis}`} />
          Kriz Öncesi Ort.
        </div>
        <div className={`text-xl font-bold ${colors.textPreCrisis}`}>
          {stats.preCrisisAvg !== null ? `${stats.preCrisisAvg.toFixed(2)}%` : 'N/A'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          2020 ve Öncesi
        </div>
      </div>
    </div>
  );
};

export default EnhancedStats;