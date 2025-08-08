
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TripidIcon } from './icons';
import { Wrench } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTripTracker } from '@/hooks/use-trip-tracker';
import type { Trip } from '@/lib/types';
import { Play, Square, Route, History, Lightbulb, Trash2, MapPin, PanelLeft, ChevronUp } from 'lucide-react';
import TripMap from './trip-map';
import CurrentTripCard from '@/components/current-trip';
import TripHistory from './trip-history';
import Settings from "./settings";
import FuelInsightsForm from './fuel-insights-form';

export function TripidDashboard() {
  const { isTracking, currentTrip, tripHistory, currentPosition, startTracking, stopTracking, deleteTrip } = useTripTracker();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const tripToDisplay = selectedTrip || currentTrip;

  const handleSelectTrip = (trip: Trip | null) => {
    if (isTracking) return;
    setSelectedTrip(trip);
  }
  
  const sidebarContent = (
     <Tabs defaultValue="trip" className="w-full h-full flex flex-col">
        <TabsList className="w-full rounded-none justify-start px-2">
            <TabsTrigger value="trip" className="gap-2"><Route/> <span>Trip</span></TabsTrigger>
            <TabsTrigger value="history" className="gap-2"><History/> <span>History</span></TabsTrigger>
            <TabsTrigger value="insights" className="gap-2"><Lightbulb/> <span>Insights</span></TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Wrench/> <span>Settings</span></TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
            <div className="p-4">
                <TabsContent value="trip">
                  <CurrentTripCard />
                </TabsContent>

                <TabsContent value="history">
                  <TripHistory handleSelectTrip={handleSelectTrip} selectedTrip={selectedTrip} />
                </TabsContent>

                <TabsContent value="insights">
                  <FuelInsightsForm />
                </TabsContent>

                <TabsContent value="settings">
                    <Settings />
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
         <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-100 ml-4 my-4' : 'w-0 -ml-4'}`}>
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

       {/* Mobile Sheet / Overlay */}
       <div className="md:hidden fixed bottom-0 pb-safe mb-safe flex items-center justify-center w-full">
          <div className="w-[96%] bg-white rounded-lg shadow-lg overflow-hidden pb-safe mb-2">
            {sidebarContent}
          </div>
        </div>
    </div>
  );
}

    
