import { type NextAuthOptions, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { authLogger, LogMessages } from "@/lib/logger/exports";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
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

      // Recharger le rôle depuis la BDD pour refléter les changements en temps réel
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              twoFactorEnabled: true,
              name: true,
              firstName: true,
              lastName: true,
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.twoFactorEnabled = dbUser.twoFactorEnabled;
            // Mettre à jour le nom (OAuth = name, Credentials = firstName + lastName)
            token.name =
              dbUser.firstName && dbUser.lastName
                ? `${dbUser.firstName} ${dbUser.lastName}`
                : dbUser.name || token.name;
          }
        } catch {
          // DB indisponible (dev local sans .env) — garde le token tel quel
        }
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
