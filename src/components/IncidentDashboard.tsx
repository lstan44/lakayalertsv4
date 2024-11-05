import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Map, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import IncidentList from './IncidentList';
import IncidentMap from './IncidentMap';
import ReportIncidentModal from './ReportIncidentModal';
import ReportButton from './ReportButton';
import type { Incident } from '../types';
import { createIncident } from '../services/incidents';
import { useQueryClient } from '@tanstack/react-query';

interface IncidentDashboardProps {
  incidents: Incident[];
  isLoading: boolean;
  userLocation: { lat: number; lng: number } | null;
}

export default function IncidentDashboard({ incidents, isLoading, userLocation }: IncidentDashboardProps) {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const location = useLocation();
  const focusLocation = location.state?.focusLocation || null;
  const queryClient = useQueryClient();

  const handleSubmitReport = async (newIncident: any) => {
    try {
      await createIncident(newIncident);
      await queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setIsReportModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <main className="h-[100dvh] w-screen relative overflow-hidden pt-16">
      {/* Fixed position controls container - hidden when report modal is open */}
      {!isReportModalOpen && (
        <div className="fixed top-16 left-0 right-0 z-[1000] bg-gradient-to-b from-white/90 to-white/0 pt-4 pb-8 px-4">
          <Tabs value={view} onValueChange={(value: string) => setView(value as 'map' | 'list')}>
            <TabsList className="w-full max-w-[200px] mx-auto">
              <TabsTrigger value="map" className="flex-1">
                <Map className="w-4 h-4 mr-2" />Map
              </TabsTrigger>
              <TabsTrigger value="list" className="flex-1">
                <List className="w-4 h-4 mr-2" />List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="h-full w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : view === 'map' ? (
          <div className="h-full w-full">
            <IncidentMap 
              incidents={incidents} 
              userLocation={userLocation} 
              focusLocation={focusLocation}
              zoom={15}
            />
          </div>
        ) : (
          <div className="h-full overflow-auto pt-24 pb-24 px-4">
            <div className="max-w-2xl mx-auto">
              <IncidentList incidents={incidents} />
            </div>
          </div>
        )}
      </div>

      {/* Fixed position report button - hide when modal is open */}
      {!isReportModalOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
          <ReportButton onClick={() => setIsReportModalOpen(true)} />
        </div>
      )}

      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </main>
  );
}