// Location types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

// Ride request type
export interface RideRequest {
  trip_distance: any;
  distance_to_pickup: any;
  id: string;
  passenger_id?: any; 
  passenger_name?: string;
  pickup_location: Location;
  destination: Location;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  estimated_time?: number; // in minutes
  distance?: number; // in kilometers
}

// Ride data type
export interface RideData {
  id?: string;
  passenger: string;
  passenger_id?: any;
  driver_id?: string;
  pickup_location: Location;
  destination: Location;
  status?: string;
  created_at?: string;
  completed_at?: string;
} 