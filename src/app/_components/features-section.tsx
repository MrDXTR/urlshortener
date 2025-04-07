"use client";

import { Meteors } from "~/components/magicui/meteors";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      title: "Lightning Fast",
      description: "Optimized for speed with minimal load times.",
      meteorCount: 8,
    },
    {
      title: "Secure",
      description: "Your links are safe and protected with us.",
      meteorCount: 15,
    },
    {
      title: "Analytics",
      description: "Track your link performance over time.",
      meteorCount: 10,
    },
  ];

  return (
    <section className="w-full max-w-4xl py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">Powerful Features</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature, i) => (
          <Card key={i} className="border-primary/20 relative overflow-hidden">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </CardContent>
            <Meteors number={feature.meteorCount} />
          </Card>
        ))}
      </div>
    </section>
  );
}
