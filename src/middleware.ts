import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes protégées
const protectedRoutes = {
  admin: ["/admin"],
  account: ["/profile", "/orders", "/addresses", "/payments"],
};

// Routes publiques (auth)
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Pages 2FA admin (exclues de la redirection 2FA)
const twoFactorPages = ["/admin/settings/2fa", "/admin/verify-2fa"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupérer le token JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Vérifier si c'est une route admin
  const isAdminRoute = protectedRoutes.admin.some((route) =>
    pathname.startsWith(route)
  );

  // Vérifier si c'est une route compte utilisateur
  const isAccountRoute = protectedRoutes.account.some((route) =>
    pathname.startsWith(route)
  );

  // Vérifier si c'est une route d'authentification
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Vérifier si c'est une page 2FA
  const isTwoFactorPage = twoFactorPages.some((route) =>
    pathname.startsWith(route)
  );

  // Rediriger les utilisateurs connectés qui essaient d'accéder aux pages auth
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protection des routes admin - vérifier le rôle ADMIN
  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier si l'utilisateur est admin
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Rediriger vers config 2FA si pas encore activée (sauf si déjà sur une page 2FA)
    if (!isTwoFactorPage && !token.twoFactorEnabled) {
      return NextResponse.redirect(new URL("/admin/settings/2fa", request.url));
    }

    // Si 2FA activée mais pas vérifiée dans cette session, rediriger vers verify
    if (
      !isTwoFactorPage &&
      token.twoFactorEnabled &&
      !token.twoFactorVerified
    ) {
      return NextResponse.redirect(new URL("/admin/verify-2fa", request.url));
    }
  }

  // Protection des routes compte utilisateur
  if (isAccountRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Gestion de la locale pour i18n
  const response = NextResponse.next();

  // Ajouter les headers de sécurité
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|images|fonts).*)",
  ],
};
