"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { ShineBorder } from "~/components/magicui/shine-border";
import { AuroraText } from "~/components/magicui/aurora-text";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({
    google: false,
    github: false,
  });

  const handleGoogleSignIn = async () => {
    setIsLoading({ ...isLoading, google: true });
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading({ ...isLoading, google: false });
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading({ ...isLoading, github: true });
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading({ ...isLoading, github: false });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="border-primary/20 relative w-full max-w-md overflow-hidden">
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
            disabled={isLoading.google || isLoading.github}
            className="w-full cursor-pointer transition-colors duration-300 hover:translate-y-[-1px] hover:opacity-90"
            size="lg"
          >
            {isLoading.google ? (
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
          
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          
          <Button
            onClick={handleGithubSignIn}
            disabled={isLoading.google || isLoading.github}
            className="w-full cursor-pointer transition-colors duration-300 hover:translate-y-[-1px] hover:opacity-90 bg-[#24292e] hover:bg-[#1a1e21] text-white"
            size="lg"
          >
            {isLoading.github ? (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></span>
            ) : (
              <FaGithub className="mr-2 h-5 w-5" />
            )}
            Sign in with GitHub
          </Button>

          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
