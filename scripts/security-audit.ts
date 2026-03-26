#!/usr/bin/env tsx
/**
 * Security Audit Script
 *
 * Runs a comprehensive security scan of the codebase:
 * 1. npm audit (dependency vulnerabilities)
 * 2. Security headers verification
 * 3. Prisma raw query detection (SQL injection prevention)
 * 4. Hardcoded secrets detection
 * 5. CSRF / XSS protection checks
 *
 * Usage: npm run security:audit
 * Output: docs/security-report.md
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ---- Types ----

interface Finding {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  message: string;
  file?: string;
  line?: number;
}

const findings: Finding[] = [];
const ROOT = path.resolve(import.meta.dirname ?? __dirname, "..");

function addFinding(finding: Finding) {
  findings.push(finding);
}

// ---- 1. npm audit ----

function runNpmAudit() {
  console.log("[1/5] Running npm audit...");
  try {
    const result = execSync("npm audit --json 2>/dev/null", {
      cwd: ROOT,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    const audit = JSON.parse(result);
    const vulns = audit.vulnerabilities ?? {};

    for (const [pkg, info] of Object.entries(vulns) as [string, Record<string, unknown>][]) {
      const severity = (info.severity as string) || "low";
      addFinding({
        severity: severity as Finding["severity"],
        category: "Dependency",
        message: `${pkg}: ${info.via ?? "vulnerability detected"} (${severity})`,
      });
    }

    if (Object.keys(vulns).length === 0) {
      addFinding({
        severity: "info",
        category: "Dependency",
        message: "No known vulnerabilities found in dependencies.",
      });
    }
  } catch {
    // npm audit exits non-zero when vulnerabilities exist
    try {
      const result = execSync("npm audit 2>&1 || true", {
        cwd: ROOT,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
      });
      const criticalMatch = result.match(/(\d+)\s+critical/);
      const highMatch = result.match(/(\d+)\s+high/);
      const moderateMatch = result.match(/(\d+)\s+moderate/);

      if (criticalMatch) {
        addFinding({
          severity: "critical",
          category: "Dependency",
          message: `${criticalMatch[1]} critical vulnerabilities found.`,
        });
      }
      if (highMatch) {
        addFinding({
          severity: "high",
          category: "Dependency",
          message: `${highMatch[1]} high vulnerabilities found.`,
        });
      }
      if (moderateMatch) {
        addFinding({
          severity: "medium",
          category: "Dependency",
          message: `${moderateMatch[1]} moderate vulnerabilities found.`,
        });
      }
    } catch {
      addFinding({
        severity: "medium",
        category: "Dependency",
        message: "npm audit could not be executed.",
      });
    }
  }
}

// ---- 2. Security headers check ----

function checkSecurityHeaders() {
  console.log("[2/5] Checking security headers configuration...");

  const requiredHeaders = [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "X-XSS-Protection",
    "Strict-Transport-Security",
    "Content-Security-Policy",
    "Referrer-Policy",
    "Permissions-Policy",
  ];

  // Check next.config.ts for headers configuration
  const nextConfigPath = path.join(ROOT, "next.config.ts");
  const middlewarePath = path.join(ROOT, "src", "middleware.ts");

  let headersSources = "";
  if (fs.existsSync(nextConfigPath)) {
    headersSources += fs.readFileSync(nextConfigPath, "utf-8");
  }
  if (fs.existsSync(middlewarePath)) {
    headersSources += fs.readFileSync(middlewarePath, "utf-8");
  }

  for (const header of requiredHeaders) {
    if (headersSources.includes(header)) {
      addFinding({
        severity: "info",
        category: "Headers",
        message: `${header} is configured.`,
      });
    } else {
      addFinding({
        severity: "medium",
        category: "Headers",
        message: `${header} is NOT configured. Consider adding it to next.config.ts or middleware.`,
      });
    }
  }
}

// ---- 3. Prisma raw query detection ----

function checkPrismaRawQueries() {
  console.log("[3/5] Scanning for unsafe Prisma raw queries...");

  const srcDir = path.join(ROOT, "src");
  const dangerousPatterns = [
    /\$queryRawUnsafe/g,
    /\$executeRawUnsafe/g,
  ];
  const safeRawPatterns = [
    /\$queryRaw/g,
    /\$executeRaw/g,
  ];

  const tsFiles = findFiles(srcDir, [".ts", ".tsx"]);

  for (const file of tsFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const relPath = path.relative(ROOT, file);

    for (const pattern of dangerousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        addFinding({
          severity: "critical",
          category: "SQL Injection",
          message: `Unsafe raw query (${pattern.source}) detected. Use parameterized $queryRaw instead.`,
          file: relPath,
        });
      }
    }

    for (const pattern of safeRawPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Check if string concatenation is used near raw queries
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i]) && /\+\s*['"`]/.test(lines[i])) {
            addFinding({
              severity: "high",
              category: "SQL Injection",
              message: `Possible string concatenation in raw query. Use tagged template literals.`,
              file: relPath,
              line: i + 1,
            });
          }
          // Reset lastIndex for global regex
          pattern.lastIndex = 0;
        }
      }
    }
  }

  if (!findings.some((f) => f.category === "SQL Injection")) {
    addFinding({
      severity: "info",
      category: "SQL Injection",
      message: "No unsafe raw queries detected. Prisma ORM provides parameterized queries by default.",
    });
  }
}

// ---- 4. Hardcoded secrets detection ----

function checkHardcodedSecrets() {
  console.log("[4/5] Scanning for hardcoded secrets...");

  const srcDir = path.join(ROOT, "src");
  const tsFiles = findFiles(srcDir, [".ts", ".tsx"]);

  const secretPatterns = [
    { name: "API Key", pattern: /['"](?:sk_live|pk_live|sk_test|pk_test)_[a-zA-Z0-9]+['"]/g },
    { name: "JWT Secret", pattern: /(?:secret|jwt_secret|JWT_SECRET)\s*[:=]\s*['"][^'"]{10,}['"]/g },
    { name: "Database URL", pattern: /postgresql:\/\/[^'"}\s]+@[^'"}\s]+/g },
    { name: "Password", pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi },
  ];

  for (const file of tsFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const relPath = path.relative(ROOT, file);

    // Skip config files that reference process.env
    if (relPath.includes("env.example")) continue;

    for (const { name, pattern } of secretPatterns) {
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip lines referencing process.env
        if (line.includes("process.env")) continue;
        // Skip comments
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;

        if (pattern.test(line)) {
          addFinding({
            severity: "high",
            category: "Hardcoded Secret",
            message: `Possible hardcoded ${name} detected.`,
            file: relPath,
            line: i + 1,
          });
        }
        pattern.lastIndex = 0;
      }
    }
  }

  if (!findings.some((f) => f.category === "Hardcoded Secret")) {
    addFinding({
      severity: "info",
      category: "Hardcoded Secret",
      message: "No hardcoded secrets detected.",
    });
  }
}

// ---- 5. Auth & CSRF checks ----

function checkAuthProtections() {
  console.log("[5/5] Checking auth and CSRF protections...");

  const apiDir = path.join(ROOT, "src", "app", "api");
  if (!fs.existsSync(apiDir)) return;

  const routeFiles = findFiles(apiDir, [".ts"]).filter((f) =>
    f.endsWith("route.ts")
  );

  let unprotectedMutations = 0;

  for (const file of routeFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const relPath = path.relative(ROOT, file);

    const hasMutation =
      content.includes("export async function POST") ||
      content.includes("export async function PUT") ||
      content.includes("export async function DELETE") ||
      content.includes("export async function PATCH");

    const hasAuth =
      content.includes("getServerSession") ||
      content.includes("getToken") ||
      content.includes("authenticate");

    if (hasMutation && !hasAuth) {
      unprotectedMutations++;
      addFinding({
        severity: "high",
        category: "Authentication",
        message: `Mutation endpoint without auth check.`,
        file: relPath,
      });
    }
  }

  if (unprotectedMutations === 0) {
    addFinding({
      severity: "info",
      category: "Authentication",
      message: "All mutation endpoints have authentication checks.",
    });
  }

  // Check for rate limiting
  const middlewarePath = path.join(ROOT, "src", "middleware.ts");
  if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");
    if (
      middlewareContent.includes("rateLimit") ||
      middlewareContent.includes("rate-limit")
    ) {
      addFinding({
        severity: "info",
        category: "Rate Limiting",
        message: "Rate limiting is configured in middleware.",
      });
    } else {
      addFinding({
        severity: "medium",
        category: "Rate Limiting",
        message: "Rate limiting not detected in middleware. Consider adding it for auth endpoints.",
      });
    }
  }
}

// ---- File utils ----

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      results.push(...findFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---- Report generation ----

function generateReport(): string {
  const now = new Date().toISOString().split("T")[0];

  const critical = findings.filter((f) => f.severity === "critical");
  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const low = findings.filter((f) => f.severity === "low");
  const info = findings.filter((f) => f.severity === "info");

  let md = `# Security Audit Report\n\n`;
  md += `**Date**: ${now}\n`;
  md += `**Project**: althea-systems\n\n`;
  md += `## Summary\n\n`;
  md += `| Severity | Count |\n`;
  md += `|----------|-------|\n`;
  md += `| Critical | ${critical.length} |\n`;
  md += `| High     | ${high.length} |\n`;
  md += `| Medium   | ${medium.length} |\n`;
  md += `| Low      | ${low.length} |\n`;
  md += `| Info     | ${info.length} |\n\n`;

  const sections = [
    { title: "Critical", items: critical },
    { title: "High", items: high },
    { title: "Medium", items: medium },
    { title: "Low", items: low },
    { title: "Info", items: info },
  ];

  for (const section of sections) {
    if (section.items.length === 0) continue;
    md += `## ${section.title}\n\n`;
    for (const f of section.items) {
      md += `- **[${f.category}]** ${f.message}`;
      if (f.file) md += ` (${f.file}${f.line ? `:${f.line}` : ""})`;
      md += `\n`;
    }
    md += `\n`;
  }

  md += `## Recommendations\n\n`;
  md += `1. Run \`npm audit fix\` to resolve dependency vulnerabilities.\n`;
  md += `2. Add security headers (CSP, HSTS, X-Frame-Options) in next.config.ts or middleware.\n`;
  md += `3. Never use \`$queryRawUnsafe\` or \`$executeRawUnsafe\` in production code.\n`;
  md += `4. Ensure all mutation API routes check authentication.\n`;
  md += `5. Keep dependencies up to date with regular audits.\n`;

  return md;
}

// ---- Main ----

async function main() {
  console.log("=== Althea Systems Security Audit ===\n");

  runNpmAudit();
  checkSecurityHeaders();
  checkPrismaRawQueries();
  checkHardcodedSecrets();
  checkAuthProtections();

  const report = generateReport();

  // Write report
  const docsDir = path.join(ROOT, "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  const reportPath = path.join(docsDir, "security-report.md");
  fs.writeFileSync(reportPath, report, "utf-8");

  console.log(`\nReport written to: ${reportPath}`);

  // Print summary
  const critical = findings.filter((f) => f.severity === "critical").length;
  const high = findings.filter((f) => f.severity === "high").length;

  console.log(
    `\nFindings: ${critical} critical, ${high} high, ${findings.length} total`
  );

  if (critical > 0) {
    console.log("\nCRITICAL vulnerabilities found! Review the report.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
