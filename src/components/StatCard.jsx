import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, trend, color, icon }) => {
  // Define color classes based on the color prop
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      border: 'border-blue-100'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      icon: 'text-orange-500',
      border: 'border-orange-100'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-500',
      border: 'border-green-100'
    }
  };
  
  const classes = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className={`${classes.bg} rounded-lg shadow-sm p-5 border ${classes.border} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center mb-3">
        {icon && <span className={`mr-2 ${classes.icon}`}>{icon}</span>}
        <div className="text-sm text-gray-600 font-medium">{title}</div>
      </div>
      <div className={`text-2xl font-bold mb-2 ${classes.text}`}>
        {value !== null ? `${value.toFixed(2)}%` : 'N/A'}
      </div>
      {trend !== null && (
        <div className={`flex items-center mt-1 text-sm ${trend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
          {trend >= 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
          <span>{Math.abs(trend).toFixed(2)}% {trend >= 0 ? 'artış' : 'azalış'}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;