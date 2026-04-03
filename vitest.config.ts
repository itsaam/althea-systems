import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/prisma.ts",
        "src/lib/auth.ts",
        "src/lib/stripe.ts",
        "src/lib/logger/**",
        "src/lib/email/**",
        "src/lib/email.ts",
        "src/lib/redis.ts",
        "src/lib/r2.ts",
        "src/lib/rate-limit.ts",
        "src/lib/backup-codes.ts",
        "src/lib/cart-cookie.ts",
        "src/lib/credit-note-pdf.ts",
        "src/lib/invoice-pdf.ts",
        "**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});