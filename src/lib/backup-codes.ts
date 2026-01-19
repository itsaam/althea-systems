import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

/**
 * Génère un code de backup au format XXXX-XXXX-XXXX
 * Utilise crypto.randomBytes pour une génération cryptographiquement sûre avec haute entropie
 */
function generateSingleBackupCode(): string {
  // Générer 6 octets aléatoires (48 bits) = 2^48 combinaisons (281 trillions)
  const buffer = randomBytes(6);
  const value = buffer.readUIntBE(0, 6);

  // Convertir en 3 groupes de 4 chiffres
  const part1 = (Math.floor(value / 100000000) % 10000)
    .toString()
    .padStart(4, "0");
  const part2 = (Math.floor(value / 10000) % 10000).toString().padStart(4, "0");
  const part3 = (value % 10000).toString().padStart(4, "0");

  return `${part1}-${part2}-${part3}`;
}

/**
 * Génère plusieurs codes de backup
 * @param count - Nombre de codes à générer (par défaut 10)
 * @returns Tableau de codes au format XXXX-XXXX-XXXX
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  const seen = new Set<string>();

  while (codes.length < count) {
    const code = generateSingleBackupCode();
    if (!seen.has(code)) {
      seen.add(code);
      codes.push(code);
    }
  }

  return codes;
}

/**
 * Hash un code de backup avec bcrypt
 * @param code - Code en clair au format XXXX-XXXX-XXXX
 * @returns Hash bcrypt du code
 */
export async function hashBackupCode(code: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(code, saltRounds);
}

/**
 * Vérifie un code de backup contre son hash
 * @param code - Code en clair au format XXXX-XXXX-XXXX
 * @param hashedCode - Hash bcrypt du code
 * @returns true si le code correspond, false sinon
 */
export async function verifyBackupCode(
  code: string,
  hashedCode: string
): Promise<boolean> {
  return bcrypt.compare(code, hashedCode);
}
