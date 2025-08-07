"use client"

import { useTripTracker } from "@/hooks/use-trip-tracker";
import { MapPin, Square, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

function CurrentTripCard() {
    const { currentTrip, stopTracking, isTracking, startTracking } = useTripTracker();
    
    const distance = currentTrip?.distance ?? 0;
    const displayDistance = distance < 1 ? (distance * 1000).toFixed(0) : distance.toFixed(2);
    const distanceUnit = distance < 1 ? 'm' : 'km';

    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="text-primary h-5 w-5"/>
                    Current Trip
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-2xl font-bold font-mono">{displayDistance}</p>
                  <p className="text-xs text-muted-foreground">{distanceUnit}</p>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Speed</p>
                  <p className="text-2xl font-bold font-mono">{currentTrip?.points.slice(-1)[0]?.speed?.toFixed(0) ?? '0'}</p>
                  <p className="text-xs text-muted-foreground">km/h</p>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Idle Time</p>
                  <p className="text-2xl font-bold font-mono">{((currentTrip?.idleTime ?? 0) / 60).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">minutes</p>
                </div>
              </div>
              {isTracking ? (
              <Button onClick={stopTracking} className="w-full" variant="destructive">
                  <Square className="mr-2 h-4 w-4" /> End Trip
              </Button>
              ) : (
              <Button onClick={startTracking} className="w-full">
                  <Play className="mr-2 h-4 w-4" /> Start Trip
              </Button>
              )}
            </CardContent>
        </Card>
    )
}

export default CurrentTripCard;