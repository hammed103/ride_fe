"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  MapIcon, NavigationIcon, Loader2Icon, AlertCircleIcon, 
  CheckCircleIcon, MapPinIcon, XIcon 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  getCurrentLocation, 
  getAddressFromCoordinates, 
  formatLocationForApi,
  searchLocations
} from "@/lib/services/location-service";
import { useAuthStore } from "@/lib/store/auth-store";
import Image from "next/image";
import { rideApi, RideData } from "@/lib/services/api";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coordinates: Coordinates;
  address?: string;
}

interface LocationOption {
  name: string;
  coordinates: Coordinates;
}

const formSchema = z.object({
  pickup_location: z.string().min(3, { message: "Please enter a valid pickup location" }),
  destination: z.string().min(3, { message: "Please enter a valid destination" }),
});

export function RideBookingForm() {
  const { user } = useAuthStore();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pickupSearchResults, setPickupSearchResults] = useState<LocationOption[]>([]);
  const [destinationSearchResults, setDestinationSearchResults] = useState<LocationOption[]>([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [mapMode, setMapMode] = useState<'pickup' | 'destination' | null>(null);
  const [selectedMapPin, setSelectedMapPin] = useState<Coordinates | null>(null);
  
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup_location: "",
      destination: "",
    },
  });

  // Request location permission and get current location when component mounts
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Handle search for pickup location
  useEffect(() => {
    const handlePickupSearch = async () => {
      const query = form.watch("pickup_location");
      if (query && query.length > 2) {
        const results = await searchLocations(query);
        setPickupSearchResults(results);
        setShowPickupDropdown(results.length > 0);
      } else {
        setPickupSearchResults([]);
        setShowPickupDropdown(false);
      }
    };

    const debounce = setTimeout(handlePickupSearch, 300);
    return () => clearTimeout(debounce);
  }, [form.watch("pickup_location")]);

  // Handle search for destination
  useEffect(() => {
    const handleDestinationSearch = async () => {
      const query = form.watch("destination");
      if (query && query.length > 2) {
        const results = await searchLocations(query);
        setDestinationSearchResults(results);
        setShowDestinationDropdown(results.length > 0);
      } else {
        setDestinationSearchResults([]);
        setShowDestinationDropdown(false);
      }
    };

    const debounce = setTimeout(handleDestinationSearch, 300);
    return () => clearTimeout(debounce);
  }, [form.watch("destination")]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickupInputRef.current && !pickupInputRef.current.contains(event.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (destinationInputRef.current && !destinationInputRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const requestLocationPermission = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const coordinates = await getCurrentLocation();
      const address = await getAddressFromCoordinates(coordinates);
      
      setPickupLocation({
        coordinates,
        address,
      });
      
      form.setValue("pickup_location", address);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Unable to access your location. Please enable location services or enter your location manually.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handlePickupSelect = (option: LocationOption) => {
    form.setValue("pickup_location", option.name);
    setPickupLocation({
      coordinates: option.coordinates,
      address: option.name
    });
    setShowPickupDropdown(false);
  };

  const handleDestinationSelect = (option: LocationOption) => {
    form.setValue("destination", option.name);
    setDestinationLocation({
      coordinates: option.coordinates,
      address: option.name
    });
    setShowDestinationDropdown(false);
  };

  const handleMapSelect = (mode: 'pickup' | 'destination') => {
    setMapMode(mode);
    if (mode === 'pickup' && pickupLocation) {
      setSelectedMapPin(pickupLocation.coordinates);
    } else if (mode === 'destination' && destinationLocation) {
      setSelectedMapPin(destinationLocation.coordinates);
    } else {
      // Default to center of map
      setSelectedMapPin({ latitude: 40.7128, longitude: -74.0060 });
    }
  };

  const handleMapClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapMode) return;

    // Get click position relative to the map container
    const mapElement = event.currentTarget;
    const rect = mapElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to "coordinates" (this is a simplified mock)
    // In a real app, you'd convert pixel coordinates to lat/lng
    const latitude = 40.7128 + (y - rect.height / 2) / 1000;
    const longitude = -74.0060 + (x - rect.width / 2) / 1000;
    
    const coordinates = { latitude, longitude };
    setSelectedMapPin(coordinates);
    
    // Get address for the selected coordinates
    const address = await getAddressFromCoordinates(coordinates);
    
    if (mapMode === 'pickup') {
      setPickupLocation({ coordinates, address });
      form.setValue("pickup_location", address);
    } else {
      setDestinationLocation({ coordinates, address });
      form.setValue("destination", address);
    }
  };

  const confirmMapSelection = () => {
    setMapMode(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!pickupLocation) {
      setLocationError("Please provide a pickup location");
      return;
    }

    if (!destinationLocation) {
      // Create a destination location object from the input value
      // In a real app, you would geocode this address
      setDestinationLocation({
        coordinates: { latitude: 0, longitude: 0 }, // Placeholder
        address: values.destination
      });
    }

    setBookingStatus('loading');

    // Prepare the data for the API
    const rideData: RideData = {
      passenger: user?.id || '',
      passenger_id: '5' || '',
      pickup_location: formatLocationForApi(pickupLocation),
      destination: destinationLocation 
        ? formatLocationForApi(destinationLocation)
        : { address: values.destination, latitude: 0, longitude: 0 },
    };

    try {
      // Make the API call to book a ride
      const response = await rideApi.findDriver(rideData);
      console.log("Ride booked successfully:", response.data);
      
      setBookingStatus('success');
    } catch (error) {
      console.error("Error booking ride:", error);
      setBookingStatus('error');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-md">
      <CardHeader>
        <CardTitle>Book Your Ride</CardTitle>
        <CardDescription>Where would you like to go today?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {locationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {bookingStatus === 'success' && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <AlertTitle>Ride Booked!</AlertTitle>
            <AlertDescription>Your ride has been booked successfully. A driver will be assigned shortly.</AlertDescription>
          </Alert>
        )}

        {bookingStatus === 'error' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Booking Error</AlertTitle>
            <AlertDescription>There was an error booking your ride. Please try again.</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Pickup Location Field */}
            <FormField
              control={form.control}
              name="pickup_location"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="flex items-center gap-2">
                    <NavigationIcon className="h-4 w-4 text-primary" />
                    Pickup Location
                  </FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-1" ref={pickupInputRef}>
                      <FormControl>
                        <Input 
                          placeholder="Enter pickup location" 
                          {...field} 
                          className="h-11 pr-8"
                        />
                      </FormControl>
                      {field.value && (
                        <button 
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => {
                            form.setValue("pickup_location", "");
                            setPickupLocation(null);
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                      {showPickupDropdown && pickupSearchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                          <div className="py-1">
                            {pickupSearchResults.map((option, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                onClick={() => handlePickupSelect(option)}
                              >
                                <MapPinIcon className="h-4 w-4 text-primary" />
                                <span>{option.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        className="h-11 w-11 flex-shrink-0"
                        onClick={requestLocationPermission}
                        disabled={isLoadingLocation}
                      >
                        {isLoadingLocation ? (
                          <Loader2Icon className="h-5 w-5 animate-spin" />
                        ) : (
                          <NavigationIcon className="h-5 w-5" />
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        className="h-11 w-11 flex-shrink-0"
                        onClick={() => handleMapSelect('pickup')}
                      >
                        <MapIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Destination Field */}
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-primary" />
                    Destination
                  </FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-1" ref={destinationInputRef}>
                      <FormControl>
                        <Input 
                          placeholder="Enter destination" 
                          {...field} 
                          className="h-11 pr-8"
                        />
                      </FormControl>
                      {field.value && (
                        <button 
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => {
                            form.setValue("destination", "");
                            setDestinationLocation(null);
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                      {showDestinationDropdown && destinationSearchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                          <div className="py-1">
                            {destinationSearchResults.map((option, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                onClick={() => handleDestinationSelect(option)}
                              >
                                <MapPinIcon className="h-4 w-4 text-primary" />
                                <span>{option.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="h-11 w-11 flex-shrink-0"
                      onClick={() => handleMapSelect('destination')}
                    >
                      <MapIcon className="h-5 w-5" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Map Selection Interface */}
            <div 
              className={`relative h-48 w-full rounded-md overflow-hidden border transition-all duration-300 ${
                mapMode ? 'border-primary' : 'border-gray-200'
              }`}
              onClick={mapMode ? handleMapClick : undefined}
              style={{ cursor: mapMode ? 'crosshair' : 'default' }}
            >
              {/* Map Background */}
              <div className="absolute inset-0">
                <Image 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
                  alt="Map view" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-white/30"></div>
              </div>

              {/* Map UI */}
              {mapMode ? (
                <>
                  {/* Map Selection Mode */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-center bg-white px-3 py-2 rounded-md shadow-sm">
                    <span className="text-sm font-medium">
                      {mapMode === 'pickup' ? 'Select Pickup Location' : 'Select Destination'}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => setMapMode(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={confirmMapSelection}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                  
                  {/* Map Pin */}
                  {selectedMapPin && (
                    <div 
                      className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ 
                        left: `${50 + (selectedMapPin.longitude + 74.0060) * 1000}px`, 
                        top: `${50 + (selectedMapPin.latitude - 40.7128) * 1000}px` 
                      }}
                    >
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                        <div className="relative flex flex-col items-center">
                          <MapPinIcon className="h-6 w-6 text-primary drop-shadow-md" />
                          <div className="absolute -bottom-1 w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Normal Map View */}
                  {!pickupLocation && !destinationLocation ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm">Select locations to see them on the map</p>
                        <p className="text-xs">Click the map icon next to each field</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Show Pickup Pin */}
                      {pickupLocation && (
                        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-md text-xs shadow-sm flex items-center">
                          <NavigationIcon className="h-3 w-3 text-primary mr-1" />
                          <span className="font-medium">Pickup:</span> {pickupLocation.address}
                        </div>
                      )}
                      
                      {/* Show Destination Pin */}
                      {destinationLocation && (
                        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-md text-xs shadow-sm flex items-center">
                          <MapPinIcon className="h-3 w-3 text-red-500 mr-1" />
                          <span className="font-medium">Destination:</span> {destinationLocation.address}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11"
              disabled={bookingStatus === 'loading' || mapMode !== null}
            >
              {bookingStatus === 'loading' ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Finding a Driver...
                </>
              ) : (
                'Find a Driver'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 