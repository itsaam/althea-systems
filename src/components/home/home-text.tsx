"use client";

import { useEffect, useState } from "react";
import { Truck, Shield, HeartPulse, Headphones } from "lucide-react";

interface HomeContent {
  title?: string;
  description?: string;
}

const features = [
  {
    icon: Truck,
    title: "Livraison sécurisée",
    description: "Expédition rapide de votre matériel médical",
  },
  {
    icon: Shield,
    title: "Qualité certifiée",
    description: "Équipements conformes aux normes médicales",
  },
  {
    icon: HeartPulse,
    title: "Expertise médicale",
    description: "Conseils de professionnels de santé",
  },
  {
    icon: Headphones,
    title: "Support dédié",
    description: "Assistance technique 7j/7",
  },
];

export default function HomeText() {
  const [content, setContent] = useState<HomeContent | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch("/api/carousel?type=content");
        if (res.ok) {
          const data = await res.json();
          if (data) setContent(data);
        }
      } catch {
        // Use default content
      }
    }
    fetchContent();
  }, []);

  return (
    <>
      {/* Features Section */}
      <section className="w-full py-16 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#d4f4f7] mb-4">
                  <feature.icon className="h-5 w-5 text-[#00a8b5]" />
                </div>
                <h3 className="font-semibold text-sm md:text-base text-[#003d5c]">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full py-20 bg-[#d4f4f7]/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#003d5c]">
            {content?.title || "Votre partenaire en équipement médical"}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {content?.description ||
              "Althea Systems est spécialisée dans la vente de matériel de pointe pour cabinets médicaux. Nous proposons une sélection rigoureuse d'équipements conformes aux normes les plus strictes, pour accompagner les professionnels de santé au quotidien."}
          </p>
        </div>
      </section>
    </>
  );
}
