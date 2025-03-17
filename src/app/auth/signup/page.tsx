"use client";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import Image from "next/image";

export default function SignUpPage() {
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2083&auto=format&fit=crop" 
          alt="Car background" 
          fill 
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Ride Management System</h1>
          <p className="text-white/80">Create a new account</p>
        </div>
        <SignUpForm />
        <div className="mt-8 text-center text-white/70 text-sm">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
} 