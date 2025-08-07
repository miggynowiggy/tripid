import { useTripTracker } from "@/hooks/use-trip-tracker";
import { Separator } from "@radix-ui/react-separator";
import { formatDistance } from "date-fns";
import { Trash2, Route } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Trip } from "@/lib/types";

interface TripHistoryProps {
    handleSelectTrip: (trip: Trip | null) => void;
    selectedTrip: Trip | null;
}

function TripHistory({ handleSelectTrip, selectedTrip }: TripHistoryProps) {
    const { tripHistory, deleteTrip, isTracking } = useTripTracker();

    return (
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
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id) }}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-1"><Route className="w-4 h-4 text-muted-foreground" /> <span>{trip.distance.toFixed(2)} km</span></div>
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
                    <Button onClick={() => handleSelectTrip(null)} variant="outline" className="w-full mt-4">Clear Selection</Button>
                )}
            </CardContent>
        </Card>
    )
}

export default TripHistory;