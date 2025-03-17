"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";

export function SignUpForm({ userType: initialUserType = "passenger" }: { userType?: "passenger" | "driver" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"passenger" | "driver">(initialUserType);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const password2 = formData.get("password2") as string;
    const email = formData.get("email") as string;
    const firstname = formData.get("firstname") as string;
    const lastname = formData.get("lastname") as string;

    // Basic validation
    if (password !== password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Register the user - use different endpoint based on userType
      const registerEndpoint = userType === "driver" 
        ? "http://127.0.0.1:8000//api/rides/auth/driver/register/"
        : "http://127.0.0.1:8000//api/rides/auth/register/";
        
      const registerResponse = await fetch(registerEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          password2,
          email,
          firstname,
          lastname,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || "Registration failed");
      }

      // Automatically log in after successful registration
      const loginResponse = await fetch("http://127.0.0.1:8000//api/rides/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error("Registration successful, but login failed. Please sign in manually.");
      }

      const userData = await loginResponse.json();
      
      // Store the token in localStorage
      if (userData.token) {
        localStorage.setItem('auth-token', userData.token);
      }
      
      login(userData);

      // Redirect based on user role
      if (userData.role === "passenger") {
        router.push("/passenger");
      } else if (userData.role === "driver") {
        router.push("/driver");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/20">
      <h2 className="text-xl font-semibold text-white mb-6">
        Create an Account
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-white text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setUserType("passenger")}
            className={`px-4 py-2 rounded-md transition-colors ${
              userType === "passenger"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            Passenger
          </button>
          <button
            type="button"
            onClick={() => setUserType("driver")}
            className={`px-4 py-2 rounded-md transition-colors ${
              userType === "driver"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            Driver
          </button>
        </div>
        <p className="text-center text-white/60 text-sm mt-2">
          I want to sign up as a {userType}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-white/90 mb-1">
                First Name
              </label>
              <input
                id="firstname"
                name="firstname"
                type="text"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-white/90 mb-1">
                Last Name
              </label>
              <input
                id="lastname"
                name="lastname"
                type="text"
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-white/90 mb-1">
              Confirm Password
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-white/70">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
} 