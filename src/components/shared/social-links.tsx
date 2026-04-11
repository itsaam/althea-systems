import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

export const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://facebook.com/altheasystems",
    icon: Facebook,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/altheasystems",
    icon: Instagram,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/althea-systems",
    icon: Linkedin,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/altheasystems",
    icon: Twitter,
  },
] as const;

interface SocialLinksProps {
  className?: string;
  iconClassName?: string;
  linkClassName?: string;
}

export default function SocialLinks({
  className,
  iconClassName,
  linkClassName,
}: SocialLinksProps) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Althea Systems sur ${name}`}
            className={cn(
              "group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white hover:text-shadow-grey-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
              linkClassName
            )}
          >
            <Icon
              className={cn("h-4 w-4", iconClassName)}
              aria-hidden="true"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
