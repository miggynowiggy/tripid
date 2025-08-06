
'use client';

import { useState, type FC, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import type { LatLngExpression, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Trip } from '@/lib/types';
import { Car, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface TripMapProps {
  tripToDisplay: Trip | null;
  currentPosition: GeolocationPosition | null;
}

const createDivIcon = (content: React.ReactNode) => {
    const iconMarkup = renderToStaticMarkup(content);
    return L.divIcon({
        html: iconMarkup,
        className: 'dummy', // required by leaflet
        iconSize: [36, 36],
        iconAnchor: [18, 36],
    });
};

const carIcon = createDivIcon(
    <div className="bg-primary rounded-full p-2 shadow-lg">
        <Car className="w-5 h-5 text-primary-foreground" />
    </div>
);

const startIcon = createDivIcon(
    <div className="bg-green-600 rounded-full p-2 shadow-lg">
        <MapPin className="w-5 h-5 text-white" />
    </div>
);
const endIcon = createDivIcon(
    <div className="bg-red-600 rounded-full p-2 shadow-lg">
        <MapPin className="w-5 h-5 text-white" />
    </div>
);


const MapUpdater: FC<{ trip: Trip | null; currentPosition: GeolocationPosition | null }> = ({ trip, currentPosition }) => {
    const map = useMap();
    useEffect(() => {
        if (currentPosition) {
            const { latitude, longitude } = currentPosition.coords;
            map.setView([latitude, longitude], map.getZoom() < 13 ? 15 : map.getZoom());
        } else if (trip && trip.points.length > 0) {
            const bounds = L.latLngBounds(trip.points.map(p => [p.lat, p.lng]));
            if(bounds.isValid()) {
              map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [trip, currentPosition, map]);

    return null;
}

const TripMap: FC<TripMapProps> = ({ tripToDisplay, currentPosition }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCreated, setMapCreated] = useState(false);

  useEffect(() => {
    setMapCreated(true);
  }, []);

  const position: LatLngExpression = currentPosition
    ? [currentPosition.coords.latitude, currentPosition.coords.longitude]
    : [51.505, -0.09]; // Default position
  
  const tripPath: LatLngExpression[] = tripToDisplay?.points.map(p => [p.lat, p.lng]) || [];
  const startPoint = tripToDisplay?.points[0];
  const endPoint = tripToDisplay?.points[tripToDisplay.points.length - 1];

  return (
    <>
      {mapCreated && <MapContainer center={position} zoom={13} className="h-full w-full z-0" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tripPath.length > 0 && <Polyline pathOptions={{ color: '#355C7D', weight: 5 }} positions={tripPath} />}
        
        {currentPosition && (
           <Marker position={position} icon={carIcon} />
        )}
        
        {!currentPosition && startPoint && (
            <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon} />
        )}
        {!currentPosition && endPoint && tripToDisplay?.endTime && (
            <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon} />
        )}
        <MapUpdater trip={tripToDisplay} currentPosition={currentPosition} />
      </MapContainer>}
    </>
  );
};

export default TripMap;
