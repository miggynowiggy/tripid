
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FuelInsightsForm } from './fuel-insights-form';
import { TripidIcon } from './icons';
import { useTripTracker } from '@/hooks/use-trip-tracker';
import type { Trip } from '@/lib/types';
import { format, formatDistance } from 'date-fns';
import { Play, Square, Route, History, Lightbulb, Trash2, MapPin, PanelLeft, ChevronUp } from 'lucide-react';
import TripMap from './trip-map';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';


export function TripidDashboard() {
  const { isTracking, currentTrip, tripHistory, currentPosition, startTracking, stopTracking, deleteTrip } = useTripTracker();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const tripToDisplay = selectedTrip || currentTrip;

  const handleSelectTrip = (trip: Trip) => {
    if (isTracking) return;
    setSelectedTrip(trip);
  }

  const sidebarContent = (
     <Tabs defaultValue="trip" className="w-full h-full flex flex-col">
        <TabsList className="w-full rounded-none justify-start px-2">
            <TabsTrigger value="trip" className="gap-2"><Route/> <span>Trip</span></TabsTrigger>
            <TabsTrigger value="history" className="gap-2"><History/> <span>History</span></TabsTrigger>
            <TabsTrigger value="insights" className="gap-2"><Lightbulb/> <span>Insights</span></TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
            <div className="p-4">
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
                              <p className="text-2xl font-bold font-mono">{((currentTrip?.idleTime ?? 0) / 60).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">minutes</p>
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
                                  <div className="flex items-center gap-1"> <span>{formatDistance(trip.endTime ?? trip.startTime, trip.startTime)}</span></div>
                                </div>
                              </div>
                            ))}
                        </div>
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
        </ScrollArea>
    </Tabs>
  );

  return (
    <div className="relative h-screen w-screen">
      <TripMap tripToDisplay={tripToDisplay} currentPosition={currentPosition} />

      {/* Desktop sidebar */}
      <div className="hidden md:flex absolute top-0 left-0 h-full">
         <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-80 ml-4 my-4' : 'w-0 -ml-4'}`}>
            <Card className="h-full w-full flex flex-col overflow-hidden">
                 <CardHeader className="flex flex-row items-center justify-between p-2 border-b">
                    <div className="flex items-center gap-2">
                        <TripidIcon className="w-8 h-8 text-primary" />
                        <h1 className="text-xl font-headline font-bold">Tripid</h1>
                    </div>
                </CardHeader>
                <div className="flex-1 min-h-0">
                    {sidebarContent}
                </div>
                <CardContent className="p-2 border-t">
                    <p className="text-xs text-muted-foreground">
                        This app works offline. Your trips are saved on this device.
                    </p>
                </CardContent>
            </Card>
         </div>
         <Button onClick={() => setSidebarOpen(!isSidebarOpen)} size="icon" variant="secondary" className="absolute top-1/2 ml-2 -translate-y-1/2 transition-all duration-300 ease-in-out" style={{ left: isSidebarOpen ? 'calc(20rem + 1rem)' : '1rem' }}>
            <PanelLeft className={`transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
        </Button>
      </div>

       {/* Mobile Sheet */}
      <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full pb-safe flex items-center justify-center">
         <Sheet>
            <SheetTrigger asChild>
                <Button className="left-1/2 mb-2">
                    <ChevronUp className="mr-2"/> View Details
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] p-0">
                 <SheetHeader className="flex flex-row items-center justify-between p-2 border-b">
                    <SheetTitle>
                        <div className="flex items-center gap-2">
                            <TripidIcon className="w-8 h-8 text-primary" />
                            <h1 className="text-xl font-headline font-bold">Tripid</h1>
                        </div>
                    </SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100%-4rem)]">
                 {sidebarContent}
                </div>
            </SheetContent>
         </Sheet>
      </div>

    </div>
  );
}
