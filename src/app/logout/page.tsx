"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { ShineBorder } from "~/components/magicui/shine-border";
import { AuroraText } from "~/components/magicui/aurora-text";
import { LogOut, ArrowLeft } from "lucide-react";

export default function LogoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="border-primary/20 relative w-full max-w-md overflow-hidden">
        <ShineBorder
          borderWidth={2}
          duration={8}
          shineColor={["#FF0080", "#7928CA"]}
          className="opacity-30 transition-opacity duration-300 hover:opacity-70"
        />

        <CardHeader className="space-y-2 text-center">
          <CardTitle>
            <AuroraText
              colors={["#FF0080", "#7928CA"]}
              className="text-3xl font-bold"
              speed={0.8}
            >
              Sign Out
            </AuroraText>
          </CardTitle>
          <CardDescription>Are you sure you want to sign out?</CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center">
          <LogOut className="text-muted-foreground h-16 w-16 opacity-80" />
        </CardContent>

        <CardFooter className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full cursor-pointer transition-all duration-300 hover:translate-y-[-1px] hover:opacity-80 sm:w-auto"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to App
          </Button>

          <Button
            onClick={handleLogout}
            variant="destructive"
            disabled={isLoading}
            className="w-full cursor-pointer transition-all duration-300 hover:translate-y-[-1px] hover:opacity-90 sm:w-auto"
            size="lg"
          >
            {isLoading ? (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></span>
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
