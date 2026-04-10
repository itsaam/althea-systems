"use client";

import { useState } from "react";
import { Check, Copy, Facebook, Linkedin, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

type ShareNetwork = "facebook" | "twitter" | "linkedin" | "copy";

function trackShare(network: ShareNetwork, url: string) {
  if (typeof window === "undefined") return;

  console.info("[share] product", { network, url });

  type WindowWithAnalytics = Window & {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, unknown>
    ) => void;
    plausible?: (event: string, options?: { props: Record<string, string> }) => void;
  };

  const w = window as WindowWithAnalytics;

  if (typeof w.gtag === "function") {
    w.gtag("event", "share", {
      method: network,
      content_type: "product",
      item_id: url,
    });
  }

  if (typeof w.plausible === "function") {
    w.plausible("Product Share", { props: { network, url } });
  }
}

export default function ShareButtons({
  url,
  title,
  description,
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description ?? "");

  const shareTargets: Array<{
    network: Exclude<ShareNetwork, "copy">;
    label: string;
    href: string;
    icon: typeof Facebook;
    hoverClass: string;
  }> = [
    {
      network: "facebook",
      label: "Partager sur Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
      hoverClass: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    },
    {
      network: "twitter",
      label: "Partager sur X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: Twitter,
      hoverClass: "hover:bg-black hover:text-white hover:border-black",
    },
    {
      network: "linkedin",
      label: "Partager sur LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      icon: Linkedin,
      hoverClass: "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
    },
  ];

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      trackShare("copy", url);
      setCopied(true);
      toast.success("Lien copié dans le presse-papier");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed", error);
      toast.error("Impossible de copier le lien");
    }
  };

  const handleShareClick = (network: Exclude<ShareNetwork, "copy">) => {
    trackShare(network, url);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        className
      )}
      aria-label="Partager ce produit"
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        Partager
      </span>
      <div className="flex items-center gap-2">
        {shareTargets.map(({ network, label, href, icon: Icon, hoverClass }) => (
          <a
            key={network}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            onClick={() => handleShareClick(network)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-[background-color,color,border-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              hoverClass
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label="Copier le lien"
          className={cn(
            "h-9 gap-1.5 rounded-full px-3 text-xs font-medium transition-all",
            copied && "border-primary text-primary"
          )}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copié" : "Copier le lien"}
        </Button>
      </div>
    </div>
  );
}
