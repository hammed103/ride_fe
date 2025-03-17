"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole, useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CarIcon, UserIcon, LockIcon, MailIcon } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function SignInForm() {
  const [role, setRole] = useState<UserRole>("passenger");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");
    
    try {
      // Make API call to login
      const response = await fetch("http://127.0.0.1:8000/api/rides/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const userData = await response.json();
      
      // Store the token in localStorage
      if (userData.token) {
        localStorage.setItem('auth-token', userData.token);
      }
      
      // Update auth store
      login({
        id: userData.id || "1",
        name: userData.name || values.username,
        email: userData.email || "",
        role: userData.role || role,
      });

      // Redirect based on role
      if (userData.role === "passenger" || role === "passenger") {
        router.push("/passenger");
      } else {
        router.push("/driver");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2 text-center">I am signing in as a:</h3>
          <Tabs 
            defaultValue="passenger" 
            className="w-full" 
            onValueChange={(value) => setRole(value as UserRole)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="passenger" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-2 py-3"
              >
                <UserIcon className="h-4 w-4" />
                Passenger
              </TabsTrigger>
              <TabsTrigger 
                value="driver"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center justify-center gap-2 py-3"
              >
                <CarIcon className="h-4 w-4" />
                Driver
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your username" 
                      {...field} 
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <LockIcon className="h-4 w-4 text-muted-foreground" />
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full h-11 mt-2 transition-all hover:scale-[1.02]"
            >
              {role === "passenger" ? (
                <>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Sign In as Passenger
                </>
              ) : (
                <>
                  <CarIcon className="mr-2 h-4 w-4" />
                  Sign In as Driver
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t pt-6">
        <div className="text-sm text-center text-muted-foreground">
          Forgot your password? <a href="#" className="text-primary hover:underline font-medium">Reset it here</a>
        </div>
        <div className="mt-4 text-center">
          <p className="text-white/70">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
              Sign Up
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
} 