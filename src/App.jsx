import { useState, useEffect } from 'react';
import InflationDashboard from './components/InflationDashboard';
import LoadingScreen from './components/LoadingScreen';
import { getDashboardLocale, getDashboardText } from './components/dashboardText';
import { fetchInflationData } from './data/inflationData';

function App() {
  const locale = getDashboardLocale(import.meta.env);
  const text = getDashboardText(locale);
  const [itoData, setItoData] = useState(null);
  const [tuikData, setTuikData] = useState(null);
  const [enagData, setEnagData] = useState(null);
  const [combinedData, setCombinedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { itoData, tuikData, enagData, combinedData } = await fetchInflationData();

        setItoData(itoData);
        setTuikData(tuikData);
        setEnagData(enagData);
        setCombinedData(combinedData ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen text={text} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">{text.error.title}</h1>
          <p className="text-gray-600 mb-4">
            {text.error.body}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {text.error.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <InflationDashboard 
      itoData={itoData}
      tuikData={tuikData}
      enagData={enagData}
      sourceCombinedData={combinedData}
      text={text}
    />
  );
}

export default App;
