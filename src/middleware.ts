import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ==================== ROUTE DEFINITIONS ====================

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

// ==================== CORS CONFIGURATION ====================

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "https://althea.vjuya.me",
  "https://www.vjuya.me",
];

if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push(
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000"
  );
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests have no Origin header
  return ALLOWED_ORIGINS.includes(origin);
}

// ==================== SECURITY HEADERS ====================

function getSecurityHeaders(): Record<string, string> {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev https://*.stripe.com https://lh3.googleusercontent.com https://*.googleusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev https://api-adresse.data.gouv.fr",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "1; mode=block",
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security":
      "max-age=63072000; includeSubDomains; preload",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Content-Security-Policy": cspDirectives.join("; "),
  };
}

// ==================== CSRF PROTECTION ====================

const CSRF_SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
const CSRF_PROTECTED_PATHS = ["/api/"];

function requiresCsrfCheck(request: NextRequest): boolean {
  if (CSRF_SAFE_METHODS.includes(request.method)) return false;

  const { pathname } = request.nextUrl;

  // Skip CSRF for webhook endpoints (they use their own signature verification)
  if (pathname.startsWith("/api/stripe/webhook")) return false;
  // Skip CSRF for NextAuth endpoints (they handle their own CSRF)
  if (pathname.startsWith("/api/auth/")) return false;

  return CSRF_PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

// ==================== MAIN MIDDLEWARE ====================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    const preflightResponse = new NextResponse(null, { status: 204 });

    if (origin && isOriginAllowed(origin)) {
      preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
      preflightResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      preflightResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-CSRF-Token"
      );
      preflightResponse.headers.set("Access-Control-Allow-Credentials", "true");
      preflightResponse.headers.set("Access-Control-Max-Age", "86400");
    }

    return preflightResponse;
  }

  // Block requests from disallowed origins (only when Origin header is present)
  if (origin && !isOriginAllowed(origin)) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      { status: 403 }
    );
  }

  // CSRF protection for mutating API requests
  if (requiresCsrfCheck(request)) {
    const csrfHeader = request.headers.get("x-csrf-token");
    const csrfCookie = request.cookies.get("csrf-token")?.value;

    if (csrfHeader && csrfCookie && csrfHeader !== csrfCookie) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }
  }

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
      return NextResponse.redirect(
        new URL("/admin/settings/2fa", request.url)
      );
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

  // Build response with security headers
  const response = NextResponse.next();

  // Apply all security headers
  const securityHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // CORS headers for allowed origins
  if (origin && isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|public|images|fonts).*)",
  ],
};
