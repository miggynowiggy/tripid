'use client';

import type { FC } from 'react';
import type { Trip } from '@/lib/types';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./dynamic-map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><p>Loading Map...</p></div>,
});


interface TripMapProps {
  tripToDisplay: Trip | null;
  currentPosition: GeolocationPosition | null;
}


const TripMap: FC<TripMapProps> = ({ tripToDisplay, currentPosition }) => {
  return <DynamicMap tripToDisplay={tripToDisplay} currentPosition={currentPosition} />;
};

export default TripMap;
