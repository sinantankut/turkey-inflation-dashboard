import React from 'react';
import { TrendingUp } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <TrendingUp size={48} className="text-blue-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Türkiye Enflasyon Gösterge Paneli</h1>
        <p className="text-gray-600 mb-6">Enflasyon verileri yükleniyor...</p>
        
        <div className="w-48 h-2 bg-blue-200 rounded mb-2"></div>
        <div className="w-36 h-2 bg-blue-200 rounded mb-2"></div>
        <div className="w-24 h-2 bg-blue-200 rounded"></div>
      </div>
      
      <div className="mt-10 text-sm text-gray-500 max-w-sm text-center">
        Bu gösterge paneli TÜİK, ENAG ve İTO enflasyon verilerini karşılaştırmalı olarak sunmaktadır.
      </div>
    </div>
  );
};

export default LoadingScreen;