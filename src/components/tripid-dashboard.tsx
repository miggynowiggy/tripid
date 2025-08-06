'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FuelInsightsForm } from './fuel-insights-form';
import { TripidIcon } from './icons';
import { useTripTracker } from '@/hooks/use-trip-tracker';
import type { Trip } from '@/lib/types';
import { format, formatDistance } from 'date-fns';
import { Play, Square, Gauge, Clock, Route, History, Lightbulb, Trash2, MapPin } from 'lucide-react';

const TripMap = dynamic(() => import('@/components/trip-map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><p>Loading Map...</p></div>,
});

export function TripidDashboard() {
  const { isTracking, currentTrip, tripHistory, currentPosition, startTracking, stopTracking, deleteTrip, setTripHistory } = useTripTracker();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  
  const tripToDisplay = selectedTrip || currentTrip;

  const handleSelectTrip = (trip: Trip) => {
    if (isTracking) return;
    setSelectedTrip(trip);
  }

  return (
    <>
      <Sidebar side="left" collapsible="icon" className="border-r">
        <SidebarHeader className="items-center">
            <div className="flex items-center gap-2">
                <TripidIcon className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-headline font-bold group-data-[collapsible=icon]:hidden">Tripid</h1>
            </div>
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden ml-auto"/>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <Tabs defaultValue="trip" className="w-full">
            <TabsList className="w-full rounded-none justify-start px-2">
              <TabsTrigger value="trip" className="gap-2"><Route/> <span className="group-data-[collapsible=icon]:hidden">Trip</span></TabsTrigger>
              <TabsTrigger value="history" className="gap-2"><History/> <span className="group-data-[collapsible=icon]:hidden">History</span></TabsTrigger>
              <TabsTrigger value="insights" className="gap-2"><Lightbulb/> <span className="group-data-[collapsible=icon]:hidden">Insights</span></TabsTrigger>
            </TabsList>

            <div className="p-4 group-data-[collapsible=icon]:p-2">
                <TabsContent value="trip">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="text-primary"/>
                        Current Trip
                      </CardTitle>
                      <CardDescription>
                        {isTracking ? "Your journey is being recorded." : "Start a new trip to begin tracking."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isTracking ? (
                        <Button onClick={stopTracking} className="w-full" variant="destructive">
                          <Square className="mr-2 h-4 w-4" /> End Trip
                        </Button>
                      ) : (
                        <Button onClick={startTracking} className="w-full">
                          <Play className="mr-2 h-4 w-4" /> Start Trip
                        </Button>
                      )}
                       <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="p-2 bg-muted rounded-md">
                              <p className="text-sm text-muted-foreground">Speed</p>
                              <p className="text-2xl font-bold font-mono">{currentTrip?.points.slice(-1)[0]?.speed?.toFixed(0) ?? '0'}</p>
                              <p className="text-xs text-muted-foreground">km/h</p>
                          </div>
                          <div className="p-2 bg-muted rounded-md">
                              <p className="text-sm text-muted-foreground">Distance</p>
                              <p className="text-2xl font-bold font-mono">{currentTrip?.distance.toFixed(2) ?? '0.00'}</p>
                              <p className="text-xs text-muted-foreground">km</p>
                          </div>
                           <div className="p-2 bg-muted rounded-md col-span-2">
                              <p className="text-sm text-muted-foreground">Idle Time</p>
                              <p className="text-2xl font-bold font-mono">{new Date(currentTrip?.idleTime * 1000 ?? 0).toISOString().slice(11, 19)}</p>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                   <Card>
                    <CardHeader>
                      <CardTitle>Trip History</CardTitle>
                      <CardDescription>Review your past journeys.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tripHistory.length > 0 ? (
                        <ScrollArea className="h-[50vh]">
                          <div className="space-y-4">
                            {tripHistory.map(trip => (
                              <div key={trip.id} onClick={() => handleSelectTrip(trip)} className={`p-3 rounded-lg border cursor-pointer ${selectedTrip?.id === trip.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">{trip.name}</p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(trip.startTime), 'PPp')}</p>
                                  </div>
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => {e.stopPropagation(); deleteTrip(trip.id)}}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-sm">
                                  <div className="flex items-center gap-1"><Route className="w-4 h-4 text-muted-foreground"/> <span>{trip.distance.toFixed(2)} km</span></div>
                                  <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-muted-foreground"/> <span>{formatDistance(trip.endTime ?? trip.startTime, trip.startTime)}</span></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                          <Alert>
                              <AlertTitle>No trips yet</AlertTitle>
                              <AlertDescription>Complete a trip to see its history here.</AlertDescription>
                          </Alert>
                      )}
                      {selectedTrip && !isTracking && (
                        <Button onClick={() => setSelectedTrip(null)} variant="outline" className="w-full mt-4">Clear Selection</Button>
                      )}
                    </CardContent>
                   </Card>
                </TabsContent>

                <TabsContent value="insights">
                  <FuelInsightsForm tripHistory={tripHistory} />
                </TabsContent>
            </div>
        </SidebarContent>
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Offline Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This app works offline. Your trips are saved on this device.
              </p>
            </CardContent>
          </Card>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
          <TripMap tripToDisplay={tripToDisplay} currentPosition={currentPosition} />
      </SidebarInset>
    </>
  );
}
