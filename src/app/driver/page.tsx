"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CarIcon, MapPinIcon, BellIcon, HistoryIcon, 
  DollarSignIcon, CalendarIcon, ClockIcon, CheckCircleIcon, 
  ChevronRightIcon, SettingsIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { RideRequestsList } from "@/components/driver/ride-requests-list";

export default function DriverDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Redirect to login if not authenticated or not a driver
    if (!isAuthenticated || user?.role !== "driver") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated || user?.role !== "driver") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with background */}
      <div className="relative bg-primary h-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
            alt="City traffic" 
            fill 
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 container mx-auto h-full flex items-end justify-between pb-6 px-4">
          <div>
            <Badge className="mb-2 bg-white/20 text-white hover:bg-white/30">Driver</Badge>
            <h1 className="text-3xl font-bold text-white mb-1">Driver Dashboard</h1>
            <p className="text-primary-foreground/80">Welcome back, {user.name}</p>
          </div>
          <div>
            <Button 
              className={`flex items-center gap-2 ${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              onClick={() => setIsOnline(!isOnline)}
            >
              <CarIcon className="h-4 w-4" />
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
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
              variant={activeTab === "requests" ? "default" : "ghost"} 
              className="rounded-full" 
              onClick={() => setActiveTab("requests")}
            >
              Ride Requests
            </Button>
            <Button 
              variant={activeTab === "earnings" ? "default" : "ghost"} 
              className="rounded-full" 
              onClick={() => setActiveTab("earnings")}
            >
              Earnings
            </Button>
            <Button 
              variant={activeTab === "settings" ? "default" : "ghost"} 
              className="rounded-full" 
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div>
            {/* Dashboard content */}
          </div>
        )}
        
        {activeTab === "requests" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Ride Requests</h2>
            <RideRequestsList />
          </div>
        )}
        
        {/* ... other tabs ... */}
      </div>
    </div>
  );
} 