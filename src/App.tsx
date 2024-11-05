import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import Header from './components/Header';
import IncidentDashboard from './components/IncidentDashboard';
import IncidentDetail from './components/IncidentDetail';
import { fetchIncidents } from './services/incidents';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchInterval: 1000 * 30,
      retry: 1,
      networkMode: 'online',
    },
  },
});

interface LocationContextType {
  userLocation: { lat: number; lng: number } | null;
  setMapView: (location: { lat: number; lng: number }) => void;
}

export const LocationContext = React.createContext<LocationContextType>({
  userLocation: null,
  setMapView: () => {},
});

function AppContent() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isInitialLocationSet, setIsInitialLocationSet] = useState(false);

  const { data: incidents = [], isLoading, error } = useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
  });

  useEffect(() => {
    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setUserLocation({ lat: 18.9712, lng: -72.2852 }); // Default to Haiti
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          
          // Only set initial map view once when location is first obtained
          if (!isInitialLocationSet) {
            setMapView(newLocation);
            setIsInitialLocationSet(true);
          }
        },
        () => {
          setUserLocation({ lat: 18.9712, lng: -72.2852 }); // Default to Haiti on error
        },
        { 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    };

    getUserLocation();
  }, [isInitialLocationSet]);

  const setMapView = (location: { lat: number; lng: number }) => {
    navigate('/', { state: { focusLocation: location } });
  };

  const sortedIncidents = React.useMemo(() => {
    if (!userLocation || !incidents.length) return incidents;

    return [...incidents].sort((a, b) => {
      if (!a.location || !b.location) return 0;
      
      const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const distA = getDistance(
        userLocation.lat,
        userLocation.lng,
        a.location.lat,
        a.location.lng
      );
      const distB = getDistance(
        userLocation.lat,
        userLocation.lng,
        b.location.lat,
        b.location.lng
      );

      return distA - distB;
    });
  }, [incidents, userLocation]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Incidents</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <LocationContext.Provider value={{ userLocation, setMapView }}>
      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <Routes>
          <Route
            path="/"
            element={
              <IncidentDashboard
                incidents={sortedIncidents}
                isLoading={isLoading}
                userLocation={userLocation}
              />
            }
          />
          <Route
            path="/incident/:id"
            element={<IncidentDetail incidents={incidents} />}
          />
        </Routes>
      </div>
    </LocationContext.Provider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}