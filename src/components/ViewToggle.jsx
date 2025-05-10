import React from 'react';
import { LineChart, BarChart2, Grid } from 'lucide-react';

const ViewToggle = ({ activeView, setActiveView }) => {
  const views = [
    { id: 'line', label: 'Çizgi Grafik', icon: <LineChart size={16} /> },
    { id: 'heatmap', label: 'Isı Haritası', icon: <Grid size={16} /> },
    { id: 'yearly', label: 'Yıllık Değerler', icon: <BarChart2 size={16} /> }
  ];

  return (
    <div className="flex border border-gray-300 rounded-md overflow-hidden shadow-sm">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => setActiveView(view.id)}
          className={`px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1 ${
            activeView === view.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-inner'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>{view.icon}</span>
          <span>{view.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;