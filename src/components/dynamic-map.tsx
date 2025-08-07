
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Trip } from '@/lib/types';
import { Car, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface DynamicMapProps {
  tripToDisplay: Trip | null;
  currentPosition: GeolocationPosition | null;
}

const createDivIcon = (content: React.ReactNode) => {
  const iconMarkup = renderToStaticMarkup(content);
  return L.divIcon({
    html: iconMarkup,
    className: 'dummy',
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

const DynamicMap = ({ tripToDisplay, currentPosition }: DynamicMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const currentPosMarkerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const initialCenterSet = useRef(false);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
        const initialCenter: L.LatLngExpression = currentPosition 
            ? [currentPosition.coords.latitude, currentPosition.coords.longitude] 
            : [51.505, -0.09];

      mapInstanceRef.current = L.map(mapRef.current, {
        center: initialCenter,
        zoom: 20,
        scrollWheelZoom: true,
      });

      if (currentPosition) {
        initialCenterSet.current = true;
      }

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous trip layers
    polylineRef.current?.remove();
    startMarkerRef.current?.remove();
    endMarkerRef.current?.remove();
    
    // Always show current position
    if (currentPosition) {
      const { latitude, longitude } = currentPosition.coords;
      const latLng: L.LatLngExpression = [latitude, longitude];
      
      if (!currentPosMarkerRef.current) {
        currentPosMarkerRef.current = L.marker(latLng, { icon: carIcon }).addTo(map);
      } else {
        currentPosMarkerRef.current.setLatLng(latLng);
      }
      
      if (!initialCenterSet.current) {
        map.setView(latLng, 20);
        initialCenterSet.current = true;
      } else if (tripToDisplay?.id && tripToDisplay.endTime === null) {
        // Only follow the user if it's the current trip
         map.setView(latLng, map.getZoom() < 13 ? 15 : map.getZoom());
      }
    }


    if (tripToDisplay && tripToDisplay.points.length > 0) {
      const tripPath: L.LatLngExpression[] = tripToDisplay.points.map(p => [p.lat, p.lng]);
      polylineRef.current = L.polyline(tripPath, { color: '#355C7D', weight: 5 }).addTo(map);

      const startPoint = tripToDisplay.points[0];
      if (startPoint) {
        startMarkerRef.current = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }).addTo(map);
      }

      if (tripToDisplay.endTime) {
        const endPoint = tripToDisplay.points[tripToDisplay.points.length - 1];
        if (endPoint) {
          endMarkerRef.current = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }).addTo(map);
        }
      }
      
      const bounds = L.latLngBounds(tripPath);
      if(bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      // If there's no trip to display, ensure current position marker is shown if available
      if (currentPosition && currentPosMarkerRef.current) {
        currentPosMarkerRef.current.addTo(map);
      }
    }
  }, [tripToDisplay, currentPosition]);

  return <div ref={mapRef} className="h-full w-full z-0" />;
};

export default DynamicMap;
