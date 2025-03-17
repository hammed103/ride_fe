"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapIcon, ClockIcon, HistoryIcon, StarIcon, NavigationIcon, CreditCardIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { RideBookingForm } from "@/components/passenger/ride-booking-form";

export default function PassengerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated or not a passenger
    if (!isAuthenticated || user?.role !== "passenger") {
      router.push("/");
    }

    // Check for location permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        
        // Listen for changes to permission
        result.onchange = () => {
          setLocationPermission(result.state);
        };
      });
    }
  }, [isAuthenticated, user, router]);

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated || user?.role !== "passenger") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with background */}
      <div className="relative bg-primary h-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?q=80&w=2070&auto=format&fit=crop" 
            alt="City view" 
            fill 
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 container mx-auto h-full flex items-end pb-6 px-4">
          <div>
            <Badge className="mb-2 bg-white/20 text-white hover:bg-white/30">Passenger</Badge>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome, {user.name}!</h1>
            <p className="text-primary-foreground/80">Your journey awaits</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-4 py-3">
            <Button 
              variant={activeTab === "dashboard" ? "default" : "ghost"} 
              className="rounded-full" 
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </Button>
            <Button 
              variant={activeTab === "rides" ? "default" : "ghost"} 
              className="rounded-full" 
              onClick={() => setActiveTab("rides")}
            >
              My Rides
            </Button>
            <Button 
              variant={activeTab === "payments" ? "default" : "ghost"} 
              className="rounded-full" 
              onClick={() => setActiveTab("payments")}
            >
              Payments
            </Button>
            <Button 
              variant={activeTab === "profile" ? "default" : "ghost"} 
              className="rounded-full" 
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2">
            <RideBookingForm />
          </div>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Quick Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <ClockIcon className="mr-2 h-5 w-5 text-primary" />
                Schedule a Ride
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HistoryIcon className="mr-2 h-5 w-5 text-primary" />
                Ride History
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCardIcon className="mr-2 h-5 w-5 text-primary" />
                Payment Methods
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Location Permission Status */}
        {locationPermission && (
          <Card className="mb-8 border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Location Access</CardTitle>
              <CardDescription>
                {locationPermission === 'granted' 
                  ? 'You have granted access to your location for better ride experience.' 
                  : locationPermission === 'denied'
                  ? 'Location access is denied. Please enable location services for better experience.'
                  : 'Location permission is prompt. We recommend allowing location access.'}
              </CardDescription>
            </CardHeader>
            {locationPermission !== 'granted' && (
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(() => {
                      // This will trigger the browser permission prompt if not already granted
                    });
                  }}
                >
                  Enable Location Access
                </Button>
              </CardContent>
            )}
          </Card>
        )}

        {/* Recent Rides */}
        <h2 className="text-2xl font-bold mb-4">Recent Rides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Downtown Trip</CardTitle>
                <Badge>Completed</Badge>
              </div>
              <CardDescription>Yesterday, 3:30 PM</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                  <NavigationIcon className="h-3 w-3 text-primary" />
                </div>
                <span>Home</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                  <MapIcon className="h-3 w-3 text-primary" />
                </div>
                <span>Downtown Mall</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">4.8</span>
              </div>
              <span className="font-medium">$12.50</span>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-all border-none shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Airport Ride</CardTitle>
                <Badge>Completed</Badge>
              </div>
              <CardDescription>Last week, 8:15 AM</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                  <NavigationIcon className="h-3 w-3 text-primary" />
                </div>
                <span>Home</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                  <MapIcon className="h-3 w-3 text-primary" />
                </div>
                <span>International Airport</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">5.0</span>
              </div>
              <span className="font-medium">$34.75</span>
            </CardFooter>
          </Card>
        </div>

        {/* Promotions */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-white border-none shadow-lg">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
            <div>
              <h3 className="text-xl font-bold mb-2">50% Off Your Next Ride!</h3>
              <p className="opacity-90 mb-4 md:mb-0">Use code WELCOME50 on your next booking</p>
            </div>
            <Button variant="secondary" className="whitespace-nowrap">
              Apply Coupon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 