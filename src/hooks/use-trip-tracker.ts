'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Trip, TripPoint } from '@/lib/types';
import { useLocalStorage } from './use-local-storage';
import { useToast } from './use-toast';
import { format } from 'date-fns';

const haversineDistance = (p1: TripPoint, p2: TripPoint): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLon = (p2.lng - p1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const IDLE_SPEED_THRESHOLD = 5; // km/h

export function useTripTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const initialTripHistory = useMemo(() => [], []);
  const [tripHistory, setTripHistory] = useLocalStorage<Trip[]>('tripHistory', initialTripHistory);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  
  const watcherId = useRef<number | null>(null);
  const lastPointRef = useRef<TripPoint | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation is not supported by your browser", variant: "destructive" });
      return;
    }

    const tripId = new Date().toISOString();
    const newTrip: Trip = {
      id: tripId,
      startTime: Date.now(),
      endTime: null,
      points: [],
      distance: 0,
      idleTime: 0,
      name: `Trip - ${format(new Date(), 'MMM d, yyyy h:mm a')}`
    };

    setCurrentTrip(newTrip);
    setIsTracking(true);
    lastPointRef.current = null;

    watcherId.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position);
        setCurrentTrip(prevTrip => {
          if (!prevTrip) return null;
          
          const newPoint: TripPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed: position.coords.speed ? position.coords.speed * 3.6 : 0, // m/s to km/h
            timestamp: position.timestamp,
          };
          
          let newDistance = prevTrip.distance;
          if (lastPointRef.current) {
            newDistance += haversineDistance(lastPointRef.current, newPoint);
          }
          lastPointRef.current = newPoint;

          // Idle time calculation
          let newIdleTime = prevTrip.idleTime;
          const currentSpeed = newPoint.speed || 0;
          if(currentSpeed < IDLE_SPEED_THRESHOLD) {
            if(!idleTimerRef.current) {
              idleTimerRef.current = setInterval(() => {
                setCurrentTrip(t => t ? {...t, idleTime: t.idleTime + 1} : null)
              }, 1000);
            }
          } else {
            if(idleTimerRef.current) {
              clearInterval(idleTimerRef.current);
              idleTimerRef.current = null;
            }
          }

          return { ...prevTrip, points: [...prevTrip.points, newPoint], distance: newDistance, idleTime: newIdleTime };
        });
      },
      (error) => {
        toast({ title: `Geolocation error: ${error.message}`, variant: "destructive" });
        stopTracking();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    toast({ title: "Trip started!", description: "We are now tracking your journey." });
  };

  const stopTracking = useCallback(() => {
    if (watcherId.current) {
      navigator.geolocation.clearWatch(watcherId.current);
      watcherId.current = null;
    }
    if(idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    setIsTracking(false);
    if (currentTrip && currentTrip.points.length > 0) {
      const finalTrip = { ...currentTrip, endTime: Date.now() };
      setTripHistory(prevHistory => [finalTrip, ...prevHistory]);
      toast({ title: "Trip ended!", description: "Your journey has been saved." });
    } else {
        toast({ title: "Trip cancelled", description: "Not enough data was recorded." });
    }
    setCurrentTrip(null);
    lastPointRef.current = null;
  }, [currentTrip, setTripHistory, toast]);

  useEffect(() => {
    return () => {
      if (watcherId.current) {
        navigator.geolocation.clearWatch(watcherId.current);
      }
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, []);

  const deleteTrip = (tripId: string) => {
    setTripHistory(prev => prev.filter(trip => trip.id !== tripId));
    toast({title: "Trip deleted."});
  }

  return { isTracking, currentTrip, tripHistory, currentPosition, startTracking, stopTracking, deleteTrip, setTripHistory };
}
