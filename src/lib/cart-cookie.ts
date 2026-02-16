import { cookies } from "next/headers";

export interface CartCookieItem {
  productId: string;
  quantity: number;
}

const CART_COOKIE_NAME = "cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; 

export async function getCartFromCookie(): Promise<CartCookieItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get(CART_COOKIE_NAME);
  
  if (!cartCookie?.value) {
    return [];
  }

  try {
    return JSON.parse(cartCookie.value);
  } catch {
    return [];
  }
}

export async function saveCartToCookie(cart: CartCookieItem[]): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CART_COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearCartCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE_NAME);
}