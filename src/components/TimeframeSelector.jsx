import React from 'react';
import { Calendar } from 'lucide-react';

const TimeframeSelector = ({ selectedTimeframe, setSelectedTimeframe }) => {
  const timeframes = [
    { id: '6m', label: '6 Ay' },
    { id: '1y', label: '1 Yıl' },
    { id: '2y', label: '2 Yıl' },
    { id: '5y', label: '5 Yıl' },
    { id: 'all', label: 'Tümü' }
  ];

  return (
    <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe.id}
          onClick={() => setSelectedTimeframe(timeframe.id)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedTimeframe === timeframe.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-inner'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;