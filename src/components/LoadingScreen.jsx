import { TrendingUp } from 'lucide-react';
import { getDashboardText } from './dashboardText';

const LoadingScreen = ({ text = getDashboardText() }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <TrendingUp size={48} className="text-blue-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{text.loading.title}</h1>
        <p className="text-gray-600 mb-6">{text.loading.body}</p>
        
        <div className="w-48 h-2 bg-blue-200 rounded mb-2"></div>
        <div className="w-36 h-2 bg-blue-200 rounded mb-2"></div>
        <div className="w-24 h-2 bg-blue-200 rounded"></div>
      </div>
      
      <div className="mt-10 text-sm text-gray-500 max-w-sm text-center">
        {text.loading.description}
      </div>
    </div>
  );
};

export default LoadingScreen;
