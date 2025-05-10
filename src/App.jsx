import { useState, useEffect } from 'react';
import InflationDashboard from './components/InflationDashboard';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [itoData, setItoData] = useState(null);
  const [tuikData, setTuikData] = useState(null);
  const [enagData, setEnagData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a production environment with Firebase, use the storage paths
        // For development, these can be placed in the public directory
        const itoResponse = await fetch('/data/ito_simple_inflation.json');
        const tuikResponse = await fetch('/data/tuik_inflation.json');
        const enagResponse = await fetch('/data/enag_inflation.json');
        
        if (!itoResponse.ok || !tuikResponse.ok || !enagResponse.ok) {
          throw new Error('Failed to fetch data files');
        }
        
        const itoJson = await itoResponse.json();
        const tuikJson = await tuikResponse.json();
        const enagJson = await enagResponse.json();
        
        setItoData(itoJson);
        setTuikData(tuikJson);
        setEnagData(enagJson);
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
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Veri Yüklenirken Hata Oluştu</h1>
          <p className="text-gray-600 mb-4">
            Enflasyon verilerini yüklerken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Yeniden Dene
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
    />
  );
}

export default App;