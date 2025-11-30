"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactForm() {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="name">Nom</Label>
        <Input id="name" placeholder="Votre nom" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="votre@email.com" />
      </div>
      <div>
        <Label htmlFor="subject">Sujet</Label>
        <Input id="subject" placeholder="Sujet de votre message" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Votre message..."
        />
      </div>
      <Button type="submit">Envoyer</Button>
    </form>
  );
}
