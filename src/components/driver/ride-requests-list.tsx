"use client";

import { useState, useEffect } from "react";
import { RideRequestCard } from "./ride-request-card";
import { rideApi } from "@/lib/services/api";
import { RideRequest } from "@/lib/types";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader2Icon } from "lucide-react";

export function RideRequestsList() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRideRequests();
  }, []);

  const fetchRideRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await rideApi.getRideRequests();
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching ride requests:", err);
      setError("Failed to load ride requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await rideApi.respondToRideRequest(requestId, status);
      // Update the local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, status: status.toUpperCase() as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' } : req
        )
      );
    } catch (err) {
      console.error(`Error ${status} ride request:`, err);
      // Show error message to user
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
        <p className="text-destructive">{error}</p>
        <button 
          onClick={fetchRideRequests}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 bg-muted/50 rounded-md text-center">
        <p className="text-muted-foreground">No ride requests available at the moment.</p>
        <p className="text-sm text-muted-foreground mt-1">Check back later or refresh.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.map(request => (
        <RideRequestCard 
          key={request.id} 
          request={request} 
          onStatusChange={(requestId: string, status: 'ACCEPTED' | 'REJECTED') => handleStatusChange(requestId, status.toLowerCase() as 'ACCEPTED' | 'REJECTED')}
        />
      ))}
    </div>
  );
} 