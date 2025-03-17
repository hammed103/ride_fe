"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, ClockIcon, UserIcon, DollarSignIcon } from "lucide-react";
import { RideRequestModal } from "./ride-request-modal";
import { RideRequest } from "@/lib/types";

interface RideRequestCardProps {
  request: RideRequest;
  onStatusChange: (requestId: string, status: 'ACCEPTED' | 'REJECTED') => void;
}

export function RideRequestCard({ request, onStatusChange }: RideRequestCardProps) {
  const [showModal, setShowModal] = useState(false);

  // Format the estimated time as a readable string
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Calculate distance in km
  const distanceToPickup = request.distance_to_pickup?.value 
    ? (request.distance_to_pickup.value / 1000).toFixed(1) 
    : null;
  
  // Calculate trip distance in km
  const tripDistance = request.trip_distance?.value 
    ? (request.trip_distance.value / 1000).toFixed(1) 
    : null;

  // Calculate estimated fare based on trip distance
  // Base fare $5 + $1.5 per km
  const baseFare = 5;
  const ratePerKm = 1.5;
  const estimatedFare = tripDistance 
    ? `$${(baseFare + parseFloat(tripDistance) * ratePerKm).toFixed(2)}` 
    : "Calculating...";

  // Calculate estimated time (rough estimate: 2 minutes per km + 5 minutes base)
  const baseDriveTime = 5; // minutes
  const minutesPerKm = 2;
  const estimatedTime = tripDistance 
    ? Math.round(baseDriveTime + parseFloat(tripDistance) * minutesPerKm) 
    : 15; // default 15 minutes if no distance available

  return (
    <>
      <Card className="overflow-hidden border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">Ride Request</CardTitle>
            <Badge variant={request.status === "PENDING" ? 'outline' : 'default'}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Pickup</p>
                <p className="text-sm text-muted-foreground">{request.pickup_location.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Destination</p>
                <p className="text-sm text-muted-foreground">{request.destination.address}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatTime(estimatedTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{estimatedFare}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 pt-3">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => setShowModal(true)}
            disabled={request.status.toLowerCase() !== "pending"}
          >
            View Request
          </Button>
        </CardFooter>
      </Card>

      <RideRequestModal 
        request={request}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAccept={() => onStatusChange(request.id, "ACCEPTED")}
        onDecline={() => onStatusChange(request.id, "REJECTED")}
        estimatedTime={estimatedTime}
        estimatedFare={estimatedFare}
        distanceToPickup={distanceToPickup}
        tripDistance={tripDistance}
      />
    </>
  );
} 