import winston from "winston";
import path from "path";

// Chemins des fichiers de logs
const LOG_DIR = process.env.LOG_DIR || "logs";

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

// Transport console
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

// Factory pour créer un transport fichier
const createFileTransport = (filename: string, level?: string) => {
  return new winston.transports.File({
    filename: path.join(LOG_DIR, filename),
    format: fileFormat,
    level,
    maxsize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
  });
};

// Logger principal
const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transports: [
    consoleTransport,
    createFileTransport("combined.log"),
    createFileTransport("error.log", "error"),
  ],
});

export default logger;
