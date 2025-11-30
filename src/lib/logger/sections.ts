import logger from "./index";

// Sections disponibles
export type LogSection =
  | "AUTH"
  | "API"
  | "DB"
  | "STRIPE"
  | "EMAIL"
  | "CACHE"
  | "UPLOAD"
  | "ADMIN"
  | "CART"
  | "ORDER"
  | "PRODUCT"
  | "USER";

// Type pour les métadonnées
type LogMeta = Record<string, unknown>;

// Factory pour créer un logger de section
const createSectionLogger = (section: LogSection) => {
  const log = (level: string, message: string, meta?: LogMeta) => {
    logger.log(level, message, { section, ...meta });
  };

  return {
    info: (message: string, meta?: LogMeta) => log("info", message, meta),
    error: (message: string, meta?: LogMeta) => log("error", message, meta),
    warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
    debug: (message: string, meta?: LogMeta) => log("debug", message, meta),
    http: (message: string, meta?: LogMeta) => log("http", message, meta),
  };
};

// Export des loggers par section
export const authLogger = createSectionLogger("AUTH");
export const apiLogger = createSectionLogger("API");
export const dbLogger = createSectionLogger("DB");
export const stripeLogger = createSectionLogger("STRIPE");
export const emailLogger = createSectionLogger("EMAIL");
export const cacheLogger = createSectionLogger("CACHE");
export const uploadLogger = createSectionLogger("UPLOAD");
export const adminLogger = createSectionLogger("ADMIN");
export const cartLogger = createSectionLogger("CART");
export const orderLogger = createSectionLogger("ORDER");
export const productLogger = createSectionLogger("PRODUCT");
export const userLogger = createSectionLogger("USER");

// Export groupé
export const sectionLoggers = {
  auth: authLogger,
  api: apiLogger,
  db: dbLogger,
  stripe: stripeLogger,
  email: emailLogger,
  cache: cacheLogger,
  upload: uploadLogger,
  admin: adminLogger,
  cart: cartLogger,
  order: orderLogger,
  product: productLogger,
  user: userLogger,
};
