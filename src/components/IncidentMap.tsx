import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Incident } from '../types';
import 'leaflet/dist/leaflet.css';

// Component to handle map view updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

interface IncidentMapProps {
  incidents: Incident[];
  userLocation: { lat: number; lng: number } | null;
  focusLocation?: { lat: number; lng: number } | null;
  zoom?: number;
}

export default function IncidentMap({ 
  incidents, 
  userLocation,
  focusLocation,
  zoom = 15
}: IncidentMapProps) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const { t } = useTranslation();
  const defaultCenter: [number, number] = [18.9712, -72.2852];
  const center: [number, number] = focusLocation 
    ? [focusLocation.lat, focusLocation.lng]
    : userLocation 
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;
  
  const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const userLocationIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'user-location-marker'
  });

  const handleMarkerClick = (incidentId: string) => {
    navigate(`/incident/${incidentId}`);
  };

  const validIncidents = incidents.filter(incident => 
    incident.location && 
    typeof incident.location.lat === 'number' && 
    typeof incident.location.lng === 'number' &&
    !isNaN(incident.location.lat) && 
    !isNaN(incident.location.lng)
  );

  return (
    <div className="h-full w-full">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} zoom={zoom} />
        
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>{t('incident.details.yourLocation')}</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {validIncidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.location.lat, incident.location.lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(incident.id)
            }}
          >
            <Popup>
              <div 
                className="p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleMarkerClick(incident.id)}
              >
                <h3 className="font-semibold text-lg">
                  {t(`incident.types.${incident.type}`)}
                </h3>
                <p className="text-sm text-gray-600">{incident.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {incident.location.zone}
                </div>
                <div className="mt-2 text-sm text-red-600 hover:text-red-700">
                  {t('incident.details.clickToView')}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}