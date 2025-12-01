import NextAuth, { type NextAuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { authLogger, LogMessages } from "@/lib/logger/exports";

// Extension des types NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      twoFactorEnabled?: boolean;
      twoFactorVerified?: boolean;
    };
  }
  interface User {
    role?: string;
    twoFactorEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    twoFactorEnabled?: boolean;
    twoFactorVerified?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Apple OAuth
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Email/Password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          authLogger.warn(
            LogMessages.auth.connexionEchouee("email/password manquant")
          );
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          authLogger.warn(
            LogMessages.auth.connexionEchouee(credentials.email as string)
          );
          throw new Error("INVALID_CREDENTIALS");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          authLogger.warn(
            LogMessages.auth.connexionEchouee(credentials.email as string)
          );
          throw new Error("INVALID_CREDENTIALS");
        }

        // Vérifier si l'email est vérifié
        if (!user.emailVerified) {
          authLogger.warn(
            `Tentative de connexion avec email non vérifié: ${user.email}`
          );
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        authLogger.info(LogMessages.auth.connexionReussie(user.email));

        return {
          id: user.id,
          email: user.email,
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email,
          image: user.image,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/profile",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Log des connexions OAuth
      if (account?.provider !== "credentials") {
        authLogger.info(
          `Connexion via ${account?.provider} pour ${user.email}`
        );
      }
      return true;
    },
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User;
      trigger?: string;
      session?: Session;
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled || false;
        token.twoFactorVerified = false; // Toujours false à la connexion
      }
      // Mise à jour de la session si demandée (ex: après vérification 2FA)
      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.twoFactorVerified !== undefined) {
          token.twoFactorVerified = session.user.twoFactorVerified;
        }
        if (session.user?.twoFactorEnabled !== undefined) {
          token.twoFactorEnabled = session.user.twoFactorEnabled;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
        session.user.twoFactorVerified = token.twoFactorVerified as boolean;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      authLogger.info(
        LogMessages.auth.deconnexion((token?.id as string) || "unknown")
      );
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = {
  handlers: NextAuth(authOptions),
  auth: () => NextAuth(authOptions),
  signIn: NextAuth(authOptions).signIn,
  signOut: NextAuth(authOptions).signOut,
};
