
import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

const ComparisonToggle = ({ comparisonMode, setComparisonMode }) => {
  return (
    <div className="flex rounded-md shadow-sm">
      <button
        onClick={() => setComparisonMode('mom')}
        className={`px-4 py-1.5 text-sm font-medium flex items-center ${
          comparisonMode === 'mom'
            ? 'bg-blue-600 text-white border-blue-600 shadow-inner'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        } rounded-l-md`}
      >
        <Calendar className="w-4 h-4 mr-1" />
        <span>Aylık Değişim</span>
      </button>
      <button
        onClick={() => setComparisonMode('yoy')}
        className={`px-4 py-1.5 text-sm font-medium flex items-center ${
          comparisonMode === 'yoy'
            ? 'bg-blue-600 text-white border-blue-600 shadow-inner'
            : 'bg-white text-gray-700 border border-l-0 border-gray-300 hover:bg-gray-50'
        } rounded-r-md`}
      >
        <TrendingUp className="w-4 h-4 mr-1" />
        <span>Yıllık Değişim</span>
      </button>
    </div>
  );
};

export default ComparisonToggle;