"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { i18nConfig, type Locale } from "./config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocaleCookie(locale: Locale): Promise<void> {
  if (!i18nConfig.locales.includes(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
