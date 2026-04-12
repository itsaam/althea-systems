import winston from "winston";
import path from "path";
import fs from "fs";

// Chemins des fichiers de logs
const LOG_DIR = process.env.LOG_DIR || "logs";

// Détection container : en prod containerisée on log uniquement sur stdout
// (12-factor app). Docker/swarm capture déjà tout via `docker logs`.
// Écrire des fichiers dans /app nécessiterait des droits d'écriture que
// l'utilisateur non-root du runner stage n'a pas → EACCES.
const isProduction = process.env.NODE_ENV === "production";

// Tente de créer le dossier de logs en dev ; en prod on skip les file transports.
const canWriteFiles = (() => {
  if (isProduction) return false;
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
})();

// Couleurs personnalisées pour la console
const colors: Record<string, string> = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

// Type pour le format printf
interface LogInfo {
  level: string;
  message: string;
  timestamp?: string;
  section?: string;
  [key: string]: unknown;
}

// Format de base pour tous les logs
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
  winston.format.errors({ stack: true })
);

// Format pour la console (coloré)
const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { level, message, timestamp, section, ...meta } = info as LogInfo;
    const sectionTag = section ? `[${section}]` : "";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level} ${sectionTag} ${message}${metaStr}`;
  })
);

// Format pour les fichiers (JSON)
const fileFormat = winston.format.combine(baseFormat, winston.format.json());

// Format JSON pour la console en production
const productionConsoleFormat = winston.format.combine(
  baseFormat,
  winston.format.json()
);

// Transport console : JSON en production, colore en dev
const consoleTransport = new winston.transports.Console({
  format: isProduction ? productionConsoleFormat : consoleFormat,
});

// Factory pour créer un transport fichier
const createFileTransport = (filename: string, level?: string) => {
  return new winston.transports.File({
    filename: path.join(LOG_DIR, filename),
    format: fileFormat,
    level,
    maxsize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
  });
};

// Logger principal — file transports uniquement si on peut écrire (dev local).
// En production containerisée : stdout only (12-factor).
const transports: winston.transport[] = [consoleTransport];
if (canWriteFiles) {
  transports.push(
    createFileTransport("combined.log"),
    createFileTransport("error.log", "error")
  );
}

const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transports,
});

export default logger;
