import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPinIcon,
  PhoneIcon,
  NavigationIcon,
  UserIcon,
  CheckCircleIcon,
} from "lucide-react";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import { getCurrentLocation } from "@/lib/services/location-service";

interface RideNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    passenger_name: string;
    pickup_location: {
      address: string;
      latitude: number;
      longitude: number;
    };
    destination: {
      address: string;
      latitude: number;
      longitude: number;
    };
    distance_to_pickup: {
      value: number;
      unit: string;
    };
  };
}

const containerStyle = {
  width: '100%',
  height: '300px'
};

export function RideNavigationModal({
  isOpen,
  onClose,
  request,
}: RideNavigationModalProps) {
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const carRef = useRef<google.maps.Marker | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const pickupLocation = {
    lat: request.pickup_location.latitude,
    lng: request.pickup_location.longitude
  };

  // Start watching driver's location
  useEffect(() => {
    const updateDriverLocation = async () => {
      try {
        // First check if geolocation is supported
        if (!navigator.geolocation) {
          setLocationError("Geolocation is not supported by your browser");
          return;
        }

        // Request location permission
        const coordinates = await getCurrentLocation();
        const newLocation = {
          lat: coordinates.latitude,
          lng: coordinates.longitude
        };
        setDriverLocation(newLocation);
        setLocationError(null);
        
        // Update directions if navigation is started
        if (navigationStarted && map) {
          const directionsService = new google.maps.DirectionsService();
          directionsService.route(
            {
              origin: newLocation,
              destination: pickupLocation,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK" && result) {
                setDirections(result);
              }
            }
          );
        }
      } catch (error) {
        console.error("Error getting location:", error);
        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Location permission denied. Please enable location services.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information unavailable.");
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out.");
              break;
            default:
              setLocationError("An unknown error occurred getting your location.");
          }
        } else {
          setLocationError("Failed to get your location. Please try again.");
        }
      }
    };

    // Initial location update
    updateDriverLocation();

    // Set up interval for continuous updates
    const intervalId = setInterval(updateDriverLocation, 5000);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }, [navigationStarted, map]);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  console.log("lllooo", driverLocation);

  // Function to animate car movement
  const animateCar = (result: google.maps.DirectionsResult) => {
    if (!map || !result.routes[0]) return;

    const path = result.routes[0].overview_path;
    if (!path) return;

    let currentIndex = 0;
    const moveCar = () => {
      if (currentIndex < path.length) {
        const position = path[currentIndex];
        if (carRef.current) {
          carRef.current.setPosition(position);
        }
        currentIndex++;
        setTimeout(moveCar, 100); // Adjust speed by changing timeout
      }
    };

    moveCar();
  };

  const calculateDirections = () => {
    if (!driverLocation || !map) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: driverLocation,
        destination: pickupLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          setNavigationStarted(true);
          animateCar(result);
        }
      }
    );
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="flex items-center justify-between">
          <span>Navigation to Pickup Location</span>
          <Badge variant="outline" className="bg-blue-50">
            En Route
          </Badge>
        </DialogTitle>

        <div className="space-y-4">
          {locationError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {locationError}
            </div>
          )}
          
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={driverLocation || pickupLocation}
            zoom={13}
            onLoad={onLoad}
          >
            {driverLocation && (
              <Marker
                position={driverLocation}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" fill="#000"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(24, 24),
                  anchor: new google.maps.Point(12, 12),
                }}
              />
            )}
            <Marker 
              position={pickupLocation}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#FF0000" stroke="white" stroke-width="2"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 12),
              }}
            />
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>

          {/* Passenger Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{request.passenger_name}</p>
              <p className="text-sm text-muted-foreground">Waiting for pickup</p>
            </div>
            <Button size="icon" variant="outline" className="ml-auto h-8 w-8">
              <PhoneIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Pickup Location */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Pickup Location</p>
                <p className="text-sm text-muted-foreground">
                  {request.pickup_location.address}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(request.distance_to_pickup.value / 1000).toFixed(1)} km away
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Button */}
          <Button 
            className="w-full" 
            onClick={calculateDirections}
            disabled={!driverLocation}
          >
            <NavigationIcon className="mr-2 h-4 w-4" />
            {navigationStarted ? "Update Directions" : "Start Navigation"}
          </Button>

          {navigationStarted && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <p className="text-sm">Showing route to pickup location</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
