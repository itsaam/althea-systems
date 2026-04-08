import { Prisma, PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaDatabaseUrl: string | undefined;
};

if (process.env.NODE_ENV !== "production") {
  loadEnv({ path: ".env", override: true, quiet: true });
}

const databaseUrl = process.env.DATABASE_URL;

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaDatabaseUrl !== databaseUrl
) {
  void globalForPrisma.prisma.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: (process.env.NODE_ENV === "production"
      ? ["error"]
      : []) as Prisma.LogLevel[],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDatabaseUrl = databaseUrl;
}
