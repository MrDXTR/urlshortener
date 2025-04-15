"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { ShineBorder } from "~/components/magicui/shine-border";
import { AuroraText } from "~/components/magicui/aurora-text";
import { LogIn } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="border-primary/20 w-full max-w-md relative overflow-hidden">
        <ShineBorder
          borderWidth={2}
          duration={8}
          shineColor={["#0070F3", "#00CFFD"]}
          className="opacity-30 transition-opacity duration-300 hover:opacity-70"
        />
        
        <CardHeader className="space-y-2 text-center">
          <CardTitle>
            <AuroraText
              colors={["#0070F3", "#00CFFD"]}
              className="text-3xl font-bold"
              speed={0.8}
            >
              Welcome Back
            </AuroraText>
          </CardTitle>
          <CardDescription>
            Sign in to continue to URL Shortener
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full transition-colors duration-300 cursor-pointer hover:opacity-90 hover:translate-y-[-1px]"
            size="lg"
          >
            {isLoading ? (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></span>
            ) : (
              <Image
                src="/google.svg"
                alt="Google Logo"
                width={20}
                height={20}
                className="mr-2 h-5 w-5"
              />
            )}
            Sign in with Google
          </Button>
          
          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 