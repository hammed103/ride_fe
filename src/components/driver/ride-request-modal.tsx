"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPinIcon, ClockIcon, UserIcon, DollarSignIcon, 
  PhoneIcon, CalendarIcon, Loader2Icon 
} from "lucide-react";
import { RideRequest } from "@/lib/types";
import Image from "next/image";

interface RideRequestModalProps {
  request: RideRequest;
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  estimatedTime: number;
  estimatedFare: string;
  distanceToPickup: string | null;
  tripDistance: string | null;
}

export function RideRequestModal({ 
  request, 
  isOpen, 
  onClose, 
  onAccept, 
  onDecline,
  estimatedTime,
  estimatedFare,
  distanceToPickup,
  tripDistance
}: RideRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    await onAccept();
    setIsLoading(false);
    onClose();
  };

  const handleDecline = async () => {
    setIsLoading(true);
    await onDecline();
    setIsLoading(false);
    onClose();
  };

  // Format the estimated time as a readable string
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="flex items-center justify-between">
          <span>Ride Request Details</span>
          <Badge variant={request.status === "PENDING" ? 'outline' : 'default'}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </DialogTitle>

        <div className="space-y-4">
          {/* Map Preview */}
          <div className="relative h-40 w-full rounded-md overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
              alt="Map view" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Passenger Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{request.passenger_name || "Passenger"}</p>
              <p className="text-sm text-muted-foreground">Rating: ⭐ 4.8</p>
            </div>
            <Button size="icon" variant="outline" className="ml-auto h-8 w-8">
              <PhoneIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Ride Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Pickup</p>
                <p className="text-sm text-muted-foreground">{request.pickup_location.address}</p>
                {distanceToPickup && (
                  <p className="text-xs text-muted-foreground">
                    {distanceToPickup} km from your location
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Destination</p>
                <p className="text-sm text-muted-foreground">{request.destination.address}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Est. Time</p>
                <p className="text-sm font-medium">{formatTime(estimatedTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Est. Fare</p>
                <p className="text-sm font-medium">{estimatedFare}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Requested</p>
                <p className="text-sm font-medium">{formatDate(request.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Trip Distance</p>
                <p className="text-sm font-medium">{tripDistance ? `${tripDistance} km` : "Calculating..."}</p>
              </div>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleDecline}
          disabled={isLoading || request.status !== "PENDING"}
        >
          Decline
        </Button>
        <Button 
          variant="default" 
          className="flex-1"
          onClick={handleAccept}
          disabled={isLoading || request.status.toLowerCase() !== 'pending'}
        >
          {isLoading ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Accept Ride'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
} 