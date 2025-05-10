import React from 'react';
import { Database, BarChart, LineChart } from 'lucide-react';

const DataSourceSelector = ({ activeDataSource, setActiveDataSource }) => {
  return (
    <div className="flex justify-center space-x-2">
      <button 
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
          activeDataSource === 'tuik' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
        onClick={() => setActiveDataSource('tuik')}
      >
        <Database size={16} className="mr-1.5" />
        TÜİK Verileri
      </button>
      <button 
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
          activeDataSource === 'enag' 
            ? 'bg-orange-500 text-white' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
        onClick={() => setActiveDataSource('enag')}
      >
        <LineChart size={16} className="mr-1.5" />
        ENAG Verileri
      </button>
      <button 
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
          activeDataSource === 'ito' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
        onClick={() => setActiveDataSource('ito')}
      >
        <BarChart size={16} className="mr-1.5" />
        İTO Verileri
      </button>
    </div>
  );
};

export default DataSourceSelector;