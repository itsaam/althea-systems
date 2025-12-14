"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingBag, ChevronLeft, ChevronRight, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { href: "/categories", label: "Catégories" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  { href: "#", label: "Instagram" },
  { href: "#", label: "LinkedIn" },
];

interface Slide {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
}

const defaultSlides: Slide[] = [
  {
    id: "1",
    title: "Althea",
    subtitle: "Votre partenaire en équipement médical de pointe",
    image: null,
  },
  {
    id: "2",
    title: "Qualité",
    subtitle: "Des équipements certifiés aux normes les plus strictes",
    image: null,
  },
  {
    id: "3",
    title: "Innovation",
    subtitle: "Les dernières technologies au service de la santé",
    image: null,
  },
];

export default function HeroCanvasReveal() {
  const { data: session, status } = useSession();
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch("/api/carousel");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setSlides(data);
          }
        }
      } catch {
        // Use default slides
      }
    }
    fetchSlides();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#1a1a1a]">
      {/* Background image */}
      {slide?.image && (
        <div
          key={slide.id + "-bg"}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      )}
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content layer */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Navigation */}
        <nav className="w-full flex items-center p-6 md:p-8">
          {/* Logo */}
          <div className="flex-1">
            <Link 
              href="/" 
              className="text-white font-bold text-xl md:text-2xl tracking-tight hover:text-[#00a8b5] transition-colors"
            >
              Althea Systems
            </Link>
          </div>

          {/* Center nav links */}
          <div className="hidden md:flex items-center justify-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Search, Cart, Auth */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            {/* Search */}
            <button className="hidden md:flex items-center justify-center h-9 w-9 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Cart */}
            <Link href="/cart">
              <button className="flex items-center justify-center h-9 w-9 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors relative">
                <ShoppingBag className="h-[18px] w-[18px]" />
              </button>
            </Link>

            {/* Auth buttons */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse ml-2" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-9 w-9 rounded-full p-0 ml-2">
                    <Avatar className="h-8 w-8 border border-white/30">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || ""}
                      />
                      <AvatarFallback className="text-xs font-medium bg-white/20 text-white">
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link href="/login">
                  <button className="h-8 px-3 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    Connexion
                  </button>
                </Link>
                <Link href="/register">
                  <button className="h-8 px-4 rounded-full text-sm font-medium bg-white text-gray-900 hover:bg-gray-100 transition-colors">
                    S'inscrire
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Hero text - centered with slide transition */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h1 
            key={slide?.id + "-title"}
            className="text-[12vw] md:text-[8vw] font-bold text-white uppercase tracking-tighter leading-none transition-opacity duration-500"
          >
            {slide?.title}
          </h1>
          <p 
            key={slide?.id + "-subtitle"}
            className="mt-4 text-lg md:text-2xl text-white/80 max-w-2xl transition-opacity duration-500"
          >
            {slide?.subtitle}
          </p>
          
          {/* CTA Text */}
          <p className="mt-10 text-sm md:text-base text-white/50 animate-pulse" style={{ animationDuration: '3s' }}>
            Des solutions innovantes pour les professionnels de santé
          </p>

          {/* Dots indicator */}
          {slides.length > 1 && (
            <div className="mt-8 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-8 bg-white"
                      : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Carousel arrows - left and right edges */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/5 hover:bg-white/20 text-white/20 hover:text-white backdrop-blur-sm border border-white/10 hover:border-white/30 flex items-center justify-center transition-all duration-300"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/5 hover:bg-white/20 text-white/20 hover:text-white backdrop-blur-sm border border-white/10 hover:border-white/30 flex items-center justify-center transition-all duration-300"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Footer */}
        <footer className="w-full flex justify-between items-center p-6 md:p-8">
          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/70 text-sm hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <span className="text-white/50 text-sm">
              © 2025 Althea Systems
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
