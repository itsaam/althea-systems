import type { Metadata } from "next";
import ContactForm from "@/components/contact/contact-form";
import Chatbot from "@/components/contact/chatbot";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'equipe Althea Systems pour toute question sur nos equipements medicaux. Reponse rapide garantie.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Contact</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <ContactForm />
        <Chatbot />
      </div>
    </div>
  );
}
