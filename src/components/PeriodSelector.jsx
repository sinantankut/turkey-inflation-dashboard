import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const PeriodSelector = ({ selectedPeriod, setSelectedPeriod }) => {
  const periods = [
    { id: 'all', label: 'Tüm Yıllar' },
    { id: 'recent', label: 'Son 5 Yıl' },
    { id: 'crisis', label: 'Kriz Dönemi (2021+)' },
    { id: 'pre-crisis', label: 'Kriz Öncesi (2020-)' }
  ];

  return (
    <div className="flex items-center">
      <Clock size={16} className="text-gray-400 mr-2" />
      <select
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodSelector;