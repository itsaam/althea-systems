"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocaleCookie } from "@/i18n/actions";
import type { Locale } from "@/i18n/config";

type LanguageOption = {
  code: Locale;
  label: string;
  flag: string;
  native: string;
};

const LANGUAGES: LanguageOption[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", native: "Français" },
  { code: "en", label: "English", flag: "🇬🇧", native: "English" },
  { code: "ar", label: "العربية", flag: "🇸🇦", native: "العربية" },
];

type Variant = "default" | "compact";

export default function LanguageSwitcher({
  variant = "default",
}: {
  variant?: Variant;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const [pending, startTransition] = useTransition();

  const current =
    LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const onSelect = (code: Locale) => {
    if (code === locale || pending) return;
    startTransition(async () => {
      await setLocaleCookie(code);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "compact" ? "icon" : "sm"}
          aria-label={t("language") ?? "Language"}
          className={
            variant === "compact"
              ? "h-9 w-9 text-foreground/70 hover:text-foreground"
              : "h-9 gap-2 text-foreground/70 hover:text-foreground"
          }
          disabled={pending}
        >
          {variant === "compact" ? (
            <Languages className="h-[18px] w-[18px]" aria-hidden="true" />
          ) : (
            <>
              <span aria-hidden="true" className="text-base leading-none">
                {current.flag}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider">
                {current.code}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 mt-2">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("language") ?? "Language"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((lang) => {
          const isActive = lang.code === locale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onSelect={(e) => {
                e.preventDefault();
                onSelect(lang.code);
              }}
              className="cursor-pointer flex items-center justify-between gap-2"
              aria-current={isActive ? "true" : undefined}
              disabled={pending}
            >
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="text-base leading-none">
                  {lang.flag}
                </span>
                <span className="text-sm">{lang.native}</span>
              </span>
              {isActive ? (
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
