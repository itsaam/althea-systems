"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "FR",
  });

  // Redirection si panier vide
  if (items.length === 0) {
    return (
      <div className="container py-8">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ShoppingBag className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-orange-800 font-medium">Votre panier est vide</p>
                <p className="text-sm text-orange-700">Veuillez ajouter des articles avant de procéder au checkout.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Button
          onClick={() => router.push("/products")}
          className="mt-4"
        >
          Continuer vos achats
        </Button>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
    if (!formData.email.trim()) newErrors.email = "Email requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email invalide";
    if (!formData.phone.trim()) newErrors.phone = "Téléphone requis";
    if (!formData.address.trim()) newErrors.address = "Adresse requise";
    if (!formData.city.trim()) newErrors.city = "Ville requise";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Code postal requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setIsLoading(true);

    try {
      // Créer la commande (l'API renverra un paymentIntent Stripe)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: formData,
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          subtotal: total,
          shipping: 10, // À adapter selon la logique métier
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création de la commande");
      }

      const { orderId, clientSecret } = await response.json();

      // Rediriger vers la page de paiement Stripe
      if (clientSecret) {
        router.push(
          `/checkout/payment?orderId=${orderId}&clientSecret=${clientSecret}`
        );
      } else {
        toast.success("Commande créée! Redirection vers le paiement...");
        router.push(`/checkout/payment?orderId=${orderId}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors de la commande";
      toast.error(message);
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const shipping = 10; // À adapter
  const subtotal = total;
  const tax = Math.round((subtotal * 0.2) * 100) / 100; // 20% TVA exemple
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Formulaire d'adresse */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Adresse de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prénom et Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Jean"
                    disabled={isLoading}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Dupont"
                    disabled={isLoading}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jean@example.com"
                  disabled={isLoading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="06 12 34 56 78"
                  disabled={isLoading}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Adresse */}
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 rue de la Paix"
                  disabled={isLoading}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                )}
              </div>

              {/* Ville et Code postal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Paris"
                    disabled={isLoading}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="75000"
                    disabled={isLoading}
                    className={errors.postalCode ? "border-red-500" : ""}
                  />
                  {errors.postalCode && (
                    <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6"
                size="lg"
              >
                {isLoading ? "Traitement..." : "Passer la commande"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Résumé de commande */}
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Articles */}
            <div>
              <h4 className="font-medium mb-3">Articles ({items.length})</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs">Quantité: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-foreground">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totaux */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span>{shipping.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA (20%)</span>
                <span>{tax.toFixed(2)} €</span>
              </div>
            </div>

            <Separator />

            {/* Total final */}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{grandTotal.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
