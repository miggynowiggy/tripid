'use client';

import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, type FC } from 'react';
import type { Trip, TripPoint } from '@/lib/types';
import { Car } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface TripMapProps {
  tripToDisplay: Trip | null;
  currentPosition: GeolocationPosition | null;
}

const createCarIcon = () => {
    const iconMarkup = renderToStaticMarkup(
        <div className="bg-primary rounded-full p-2 shadow-lg">
            <Car className="w-5 h-5 text-primary-foreground" />
        </div>
    );
    return L.divIcon({
        html: iconMarkup,
        className: 'dummy', // required by leaflet
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

const MapUpdater: FC<{ trip: Trip | null; currentPosition: GeolocationPosition | null }> = ({ trip, currentPosition }) => {
    const map = useMap();

    useEffect(() => {
        if (currentPosition) {
            const { latitude, longitude } = currentPosition.coords;
            map.setView([latitude, longitude], map.getZoom() < 13 ? 15 : map.getZoom());
        } else if (trip && trip.points.length > 0) {
            const bounds = trip.points.map(p => [p.lat, p.lng] as LatLngExpression);
            if(bounds.length > 0) {
              map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [trip, currentPosition, map]);

    return null;
}

const TripMap: FC<TripMapProps> = ({ tripToDisplay, currentPosition }) => {
  const position: LatLngExpression = currentPosition
    ? [currentPosition.coords.latitude, currentPosition.coords.longitude]
    : [51.505, -0.09]; // Default position
  
  const tripPath: LatLngExpression[] = tripToDisplay?.points.map(p => [p.lat, p.lng]) || [];

  return (
    <MapContainer center={position} zoom={13} className="h-full w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {tripPath.length > 0 && <Polyline pathOptions={{ color: '#355C7D', weight: 5 }} positions={tripPath} />}
      {currentPosition && (
         <Marker position={position} icon={createCarIcon()} />
      )}
      <MapUpdater trip={tripToDisplay} currentPosition={currentPosition} />
    </MapContainer>
  );
};

export default TripMap;
