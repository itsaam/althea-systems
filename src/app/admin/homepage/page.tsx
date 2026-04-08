"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Star, ArrowRight } from "lucide-react";

export default function AdminHomepagePage() {
  const router = useRouter();

  const sections = [
    {
      title: "Carrousel",
      description:
        "Gérez les slides du carrousel de la page d'accueil. Maximum 3 slides actifs.",
      icon: ImageIcon,
      href: "/admin/homepage/carousel",
    },
    {
      title: "Top Produits",
      description:
        "Sélectionnez les produits mis en avant sur la page d'accueil.",
      icon: Star,
      href: "/admin/homepage/featured-products",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestion page d&apos;accueil</h1>
      <p className="text-muted-foreground">
        Configurez le contenu affiché sur la page d&apos;accueil de votre
        boutique.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Card
            key={section.href}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(section.href)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Gérer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
