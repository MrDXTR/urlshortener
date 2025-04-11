"use client";

import { Meteors } from "~/components/magicui/meteors";
import { ShineBorder } from "~/components/magicui/shine-border";
import { AuroraText } from "~/components/magicui/aurora-text";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      title: "Lightning Fast",
      description: "Optimized for speed with minimal load times.",
      meteorCount: 8,
      colors: ["#FF0080", "#7928CA"],
    },
    {
      title: "Secure",
      description: "Your links are safe and protected with us.",
      meteorCount: 15,
      colors: ["#0070F3", "#00CFFD"],
    },
    {
      title: "Analytics",
      description: "Track your link performance over time.",
      meteorCount: 10,
      colors: ["#00CC88", "#10B981"],
    },
  ];

  return (
    <section className="w-full max-w-4xl py-12">
      <h2 className="mb-8 text-center text-4xl font-bold tracking-tight">
        Powerful Features
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature, i) => (
          <Card
            key={i}
            className="border-primary/20 relative overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <ShineBorder
              borderWidth={2}
              duration={8}
              shineColor={feature.colors}
              className="opacity-30 transition-opacity duration-300 hover:opacity-70"
            />

            <CardHeader>
              <CardTitle>
                <AuroraText
                  colors={feature.colors}
                  className="font-bold"
                  speed={0.8}
                >
                  {feature.title}
                </AuroraText>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </CardContent>

            <Meteors number={feature.meteorCount} className="opacity-40" />
          </Card>
        ))}
      </div>
    </section>
  );
}
