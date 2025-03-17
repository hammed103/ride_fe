import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { RideRequest } from '../types';

// Define types for our API data
export interface RideData {
  passenger: string;
  passenger_id?: any;
  pickup_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status?: 'pending' | 'ACCEPTED' | 'in_progress' | 'completed' | 'cancelled';
  driver?: string;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  profile_picture?: string;
}

// Get the base URL from environment variables or use a default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('API Error:', error.response.data);
      
      // If unauthorized, could redirect to login
      if (error.response.status === 401) {
        console.error('Authentication error - redirecting to login');
        // window.location.href = '/auth/signin';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('API Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Ride API endpoints
export const rideApi = {
  // Book a new ride
  bookRide: (rideData: RideData) => {
    return api.post<RideData>('/api/rides/rides/', rideData);
  },
  
  // Get ride history for a user
  getRideHistory: (userId: string) => {
    return api.get<RideData[]>(`/api/rides/rides/?passenger=${userId}`);
  },
  
  // Get a specific ride by ID
  getRideById: (rideId: string) => {
    return api.get<RideData>(`/api/rides/rides/${rideId}/`);
  },
  
  // Cancel a ride
  cancelRide: (rideId: string) => {
    return api.patch<RideData>(`/api/rides/rides/${rideId}/`, { status: 'cancelled' });
  },
  
  // Get all ride requests (for drivers)
  getRideRequests: () => {
    return api.get<RideRequest[]>('/api/rides/ride-requests/');
  },
  
  // Get a specific ride request
  getRideRequestById: (requestId: string) => {
    return api.get<RideRequest>(`/api/rides/ride-requests/${requestId}/`);
  },
  
  // Respond to a ride request (accept or reject)
  respondToRideRequest: (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    return api.post<RideRequest>(`/api/rides/ride-requests/${requestId}/respond/`, {
      status
    });
  },
  
  // Match a passenger with a driver
  findDriver: (rideData: RideData) => {
    return api.post<RideData>(`/api/rides/match/`, rideData);
  }
};

// Driver API endpoints
export const driverApi = {
  // Get available rides for a driver
  getAvailableRides: () => {
    return api.get<RideData[]>('/api/rides/rides/?status=pending');
  },
  
  // Accept a ride
  acceptRide: (rideId: string, driverId: string) => {
    return api.patch<RideData>(`/api/rides/rides/${rideId}/`, { 
      driver: driverId,
      status: 'ACCEPTED' 
    });
  },
  
  // Complete a ride
  completeRide: (rideId: string) => {
    return api.patch<RideData>(`/api/rides/rides/${rideId}/`, { status: 'completed' });
  }
};

// User API endpoints
export const userApi = {
  // Get user profile
  getProfile: (userId: string) => {
    return api.get<UserProfileData>(`/api/users/${userId}/`);
  },
  
  // Update user profile
  updateProfile: (userId: string, profileData: Partial<UserProfileData>) => {
    return api.patch<UserProfileData>(`/api/users/${userId}/`, profileData);
  }
};

export default api; 