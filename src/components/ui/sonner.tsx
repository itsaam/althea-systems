"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme ?? "light") as ToasterProps["theme"];

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      expand={false}
      visibleToasts={4}
      duration={4000}
      closeButton
      richColors={false}
      gap={10}
      offset={20}
      icons={{
        success: <CircleCheckIcon className="size-4" aria-hidden="true" />,
        info: <InfoIcon className="size-4" aria-hidden="true" />,
        warning: <TriangleAlertIcon className="size-4" aria-hidden="true" />,
        error: <OctagonXIcon className="size-4" aria-hidden="true" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-sm group-[.toaster]:rounded-xl",
          title: "group-[.toast]:font-semibold group-[.toast]:text-[0.9rem]",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-[0.8rem] group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-foreground group-[.toast]:text-background group-[.toast]:rounded-md group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground",
          success:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-emerald-500 [&_[data-icon]]:text-emerald-500",
          error:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-red-500 [&_[data-icon]]:text-red-500",
          warning:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-amber-500 [&_[data-icon]]:text-amber-500",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-sky-500 [&_[data-icon]]:text-sky-500",
          loading:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-muted-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "calc(var(--radius) + 4px)",
          "--font-family": "var(--font-geist-sans), system-ui, sans-serif",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
