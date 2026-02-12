import { PrismaClient } from "@prisma/client";

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  "France": "eur", "Germany": "eur", "Italy": "eur", "Spain": "eur",
  "Belgium": "eur", "Netherlands": "eur", "Portugal": "eur", "Austria": "eur",
  "Greece": "eur", "Ireland": "eur", "Finland": "eur", "Luxembourg": "eur",

  "United States": "usd", "USA": "usd", "US": "usd",
  "Canada": "cad",

  "United Kingdom": "gbp", "UK": "gbp", "Great Britain": "gbp", "England": "gbp",

  "Japan": "jpy", "China": "cny", "India": "inr", "Singapore": "sgd",
  "Hong Kong": "hkd", "South Korea": "krw", "Thailand": "thb",

  "Australia": "aud", "New Zealand": "nzd",

  "Brazil": "brl", "Mexico": "mxn", "Argentina": "ars", "Chile": "clp",

  "Switzerland": "chf", "Sweden": "sek", "Norway": "nok", "Denmark": "dkk",
  "Poland": "pln", "Czech Republic": "czk",
};

const EXCHANGE_RATES: Record<string, number> = {
  eur: 1.0,
  usd: 1.08,
  gbp: 0.85,
  cad: 1.47,
  jpy: 161.5,
  aud: 1.66,
  chf: 0.94,
  cny: 7.85,
  inr: 90.5,
  brl: 5.35,
  mxn: 18.5,
  sgd: 1.44,
  nzd: 1.75,
  hkd: 8.45,
  krw: 1450.0,
  thb: 38.5,
  ars: 990.0,
  clp: 990.0,
  sek: 11.5,
  nok: 11.8,
  dkk: 7.45,
  pln: 4.35,
  czk: 24.5,
};

export function getCurrencyFromCountry(countryName: string): string {
  const normalized = countryName.trim();
  const currency = COUNTRY_TO_CURRENCY[normalized];
  return currency || "eur";
}

export function convertFromEur(amountEur: number, targetCurrency: string): number {
  const currency = targetCurrency.toLowerCase();
  const rate = EXCHANGE_RATES[currency] || 1.0;
  return Math.round(amountEur * rate);
}

export function isCurrencySupported(currency: string): boolean {
  const supported = [
    "usd", "eur", "gbp", "cad", "aud", "jpy", "chf", "nzd", "hkd", "sgd",
    "sek", "dkk", "pln", "nok", "czk", "brl", "mxn", "inr",
  ];
  return supported.includes(currency.toLowerCase());
}

export async function getUserCurrency(userId: string, prisma: PrismaClient): Promise<string> {
  const address = await prisma.address.findFirst({
    where: { 
      userId,
      isDefault: true,
    },
    select: { country: true },
  });

  if (!address) {
    const anyAddress = await prisma.address.findFirst({
      where: { userId },
      select: { country: true },
    });
    
    if (!anyAddress) {
      return "eur"; 
    }
    
    return getCurrencyFromCountry(anyAddress.country);
  }

  return getCurrencyFromCountry(address.country);
}