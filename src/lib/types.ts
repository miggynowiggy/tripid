export interface TripPoint {
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: number;
}

export interface Trip {
  id: string;
  startTime: number;
  endTime: number | null;
  points: TripPoint[];
  distance: number;
  idleTime: number;
  name: string;
}
