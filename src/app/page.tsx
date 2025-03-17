"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CheckCircleIcon, LogInIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to the appropriate dashboard
    if (isAuthenticated) {
      if (user?.role === "passenger") {
        router.push("/passenger");
      } else if (user?.role === "driver") {
        router.push("/driver");
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Background Image */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
            alt="City traffic background" 
            fill 
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
            <span className="text-white font-medium">Your Journey Starts Here</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Your Ride Management <span className="text-primary">System</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/80">
            Fast, reliable, and convenient rides at your fingertips
          </p>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white group transition-all duration-300"
              onClick={() => router.push("/auth/signin")}
            >
              <LogInIcon className="h-5 w-5" />
              Sign In
              <ArrowRightIcon className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primary" />
              <span>Quick Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primary" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primary" />
              <span>24/7 Support</span>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Link 
              href="/auth/signup/passenger" 
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition"
            >
              Sign up as Passenger
            </Link>
            <Link 
              href="/auth/signup/driver" 
              className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition"
            >
              Sign up as Driver
            </Link>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowRightIcon className="h-6 w-6 text-white rotate-90" />
        </div>
      </div>

      {/* Features Section with Images */}
      <div className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose Our Platform?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We provide the best ride experience with our cutting-edge technology and dedicated service.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1611716524065-622e3c4edf6d?q=80&w=1974&auto=format&fit=crop" 
                  alt="Fast service" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Fast & Reliable</h3>
                <p className="text-muted-foreground">Get to your destination quickly with our network of trusted drivers available 24/7.</p>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=2070&auto=format&fit=crop" 
                  alt="Secure payments" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
                <p className="text-muted-foreground">Cashless transactions for a seamless experience every time you ride with us.</p>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop" 
                  alt="Customer support" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
                <p className="text-muted-foreground">Our customer service team is always ready to assist you with any questions or concerns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1556122071-e404cb6f31c0?q=80&w=2070&auto=format&fit=crop" 
            alt="City skyline" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto">
            Join thousands of satisfied users who rely on our platform for their daily commute.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ride Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
