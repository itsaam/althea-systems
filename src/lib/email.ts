import { readFile } from "fs/promises";
import { Resend } from "resend";
import { emailLogger } from "@/lib/logger/exports";

// ==================== CONFIGURATION ====================

// Lazy initialization pour eviter les erreurs au build
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Althea Systems";
// Utiliser NEXTAUTH_URL en priorite (defini en prod), sinon fallback sur localhost
const APP_URL =
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 500;

// ==================== TYPES ====================

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

// ==================== BASE TEMPLATE ====================

function baseEmailTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border: 1px solid #dfe4ea;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 61, 92, 0.06);
    }
    .accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #003d5c 0%, #00a8b5 100%);
      font-size: 0;
      line-height: 0;
    }
    .header {
      padding: 32px 40px;
      background-color: #003d5c;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    .header .tagline {
      color: #9fd8df;
      margin: 4px 0 0 0;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 0.3px;
    }
    .content {
      padding: 40px;
    }
    .content h2 {
      color: #003d5c;
      margin: 0 0 24px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .content p {
      margin: 0 0 16px 0;
      color: #4a4a4a;
      font-size: 15px;
    }
    .content a {
      color: #003d5c;
      text-decoration: underline;
    }
    .content a:hover {
      color: #00a8b5;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #003d5c;
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 500;
      font-size: 14px;
      margin: 24px 0;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #00a8b5;
    }
    .footer {
      padding: 24px 40px;
      background-color: #f8fafc;
      border-top: 1px solid #dfe4ea;
      font-size: 13px;
      color: #6b7885;
    }
    .footer a {
      color: #003d5c;
      text-decoration: none;
      font-weight: 500;
    }
    .footer a:hover {
      color: #00a8b5;
      text-decoration: underline;
    }
    .info-box {
      background-color: #f0f9fa;
      border-left: 3px solid #00a8b5;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 0 4px 4px 0;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #003d5c;
    }
    .info-box p + p {
      margin-top: 8px;
    }
    .divider {
      height: 1px;
      background-color: #dfe4ea;
      margin: 32px 0;
    }
    .order-summary {
      border: 1px solid #dfe4ea;
      border-radius: 4px;
      margin: 24px 0;
      overflow: hidden;
    }
    .order-summary table {
      width: 100%;
      border-collapse: collapse;
    }
    .order-summary th,
    .order-summary td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #dfe4ea;
      font-size: 14px;
    }
    .order-summary th {
      background-color: #003d5c;
      color: #ffffff;
      font-weight: 600;
    }
    .order-summary tr:last-child td {
      border-bottom: none;
    }
    .order-summary .total td {
      font-weight: 600;
      background-color: #f0f9fa;
      color: #003d5c;
    }
    .link-fallback {
      font-size: 12px;
      color: #8a8a8a;
      word-break: break-all;
    }
    .link-fallback a {
      color: #003d5c;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="accent-bar">&nbsp;</div>
      <div class="header">
        <h1>${APP_NAME}</h1>
        <p class="tagline">Équipements médicaux professionnels</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${APP_NAME} — Tous droits réservés</p>
        <p style="margin-top: 8px;">
          <a href="${APP_URL}">Site web</a> &nbsp;&middot;&nbsp;
          <a href="${APP_URL}/contact">Contact</a> &nbsp;&middot;&nbsp;
          <a href="${APP_URL}/mentions-legales">Mentions légales</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// ==================== SEND EMAIL WITH RETRY ====================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: SendEmailParams) {
  const payload = {
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
    ...(attachments && attachments.length > 0
      ? {
          attachments: attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
          })),
        }
      : {}),
  };

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await getResend().emails.send(payload);

      if (error) {
        lastError = error;
        emailLogger.warn(
          `Resend returned error (attempt ${attempt}/${MAX_RETRIES}) to=${to} subject="${subject}" error="${error.message}"`
        );
      } else {
        emailLogger.info(
          `Email sent to=${to} subject="${subject}" id=${data?.id ?? "n/a"}${
            attachments?.length ? ` attachments=${attachments.length}` : ""
          }`
        );
        return data;
      }
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      emailLogger.warn(
        `Email send threw (attempt ${attempt}/${MAX_RETRIES}) to=${to} subject="${subject}" error="${msg}"`
      );
    }

    if (attempt < MAX_RETRIES) {
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
      await sleep(backoff);
    }
  }

  const finalMsg =
    lastError instanceof Error
      ? lastError.message
      : typeof lastError === "object" && lastError !== null && "message" in lastError
        ? String((lastError as { message: unknown }).message)
        : String(lastError);

  emailLogger.error(
    `Email send failed after ${MAX_RETRIES} attempts to=${to} subject="${subject}" error="${finalMsg}"`
  );
  throw new Error(`Email send failed: ${finalMsg}`);
}

// ==================== EMAIL TEMPLATES ====================

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  const content = `
    <h2>Bienvenue sur ${APP_NAME} !</h2>
    <p>Merci de vous être inscrit. Pour activer votre compte et profiter de toutes nos fonctionnalités, veuillez vérifier votre adresse email.</p>
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">Vérifier mon email</a>
    </p>
    <div class="info-box">
      <p><strong>Ce lien expire dans 24 heures.</strong></p>
      <p>Si vous n'avez pas créé de compte sur ${APP_NAME}, vous pouvez ignorer cet email.</p>
    </div>
    <p style="font-size: 12px; color: #888;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <a href="${verifyUrl}" style="word-break: break-all;">${verifyUrl}</a>
    </p>
  `;

  await sendEmail({
    to: email,
    subject: `Vérifiez votre adresse email - ${APP_NAME}`,
    html: baseEmailTemplate(content, "Vérification d'email"),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const content = `
    <h2>Réinitialisation de mot de passe</h2>
    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
    </p>
    <div class="info-box">
      <p><strong>⏰ Ce lien expire dans 1 heure.</strong></p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.</p>
    </div>
    <p style="font-size: 12px; color: #888;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <a href="${resetUrl}" style="word-break: break-all;">${resetUrl}</a>
    </p>
  `;

  await sendEmail({
    to: email,
    subject: `Réinitialisation de votre mot de passe - ${APP_NAME}`,
    html: baseEmailTemplate(content, "Réinitialisation de mot de passe"),
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  total: number,
  items?: Array<{ name: string; quantity: number; price: number }>
) {
  const orderUrl = `${APP_URL}/orders/${orderId}`;

  let itemsHtml = "";
  if (items && items.length > 0) {
    itemsHtml = `
      <div class="order-summary">
        <table>
          <tr>
            <th>Produit</th>
            <th>Qté</th>
            <th>Prix</th>
          </tr>
          ${items
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.price.toFixed(2)} €</td>
            </tr>
          `
            )
            .join("")}
          <tr class="total">
            <td colspan="2">Total</td>
            <td>${total.toFixed(2)} €</td>
          </tr>
        </table>
      </div>
    `;
  }

  const content = `
    <h2>🎉 Merci pour votre commande !</h2>
    <p>Votre commande <strong>#${orderId}</strong> a bien été enregistrée et est en cours de traitement.</p>
    ${itemsHtml}
    <div class="info-box">
      <p><strong>Total de la commande : ${total.toFixed(2)} €</strong></p>
    </div>
    <p style="text-align: center;">
      <a href="${orderUrl}" class="button">Voir ma commande</a>
    </p>
    <p>Nous vous enverrons un email dès que votre commande sera expédiée.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Confirmation de commande #${orderId} - ${APP_NAME}`,
    html: baseEmailTemplate(content, "Confirmation de commande"),
  });
}

export async function sendOrderShippedEmail(
  email: string,
  orderId: string,
  trackingNumber?: string,
  trackingUrl?: string
) {
  const orderUrl = `${APP_URL}/orders/${orderId}`;

  const trackingInfo = trackingNumber
    ? `
    <div class="info-box">
      <p><strong>Numéro de suivi :</strong> ${trackingNumber}</p>
      ${
        trackingUrl
          ? `<p><a href="${trackingUrl}">Suivre mon colis</a></p>`
          : ""
      }
    </div>
  `
    : "";

  const content = `
    <h2>📦 Votre commande est en route !</h2>
    <p>Bonne nouvelle ! Votre commande <strong>#${orderId}</strong> a été expédiée.</p>
    ${trackingInfo}
    <p style="text-align: center;">
      <a href="${orderUrl}" class="button">Voir les détails</a>
    </p>
  `;

  await sendEmail({
    to: email,
    subject: `Votre commande #${orderId} a été expédiée - ${APP_NAME}`,
    html: baseEmailTemplate(content, "Commande expédiée"),
  });
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  const content = `
    <h2>Bienvenue ${firstName} ! 🎉</h2>
    <p>Nous sommes ravis de vous compter parmi nous.</p>
    <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
    <ul>
      <li>Parcourir notre catalogue de produits</li>
      <li>Ajouter des articles à votre panier</li>
      <li>Passer des commandes en toute simplicité</li>
      <li>Suivre vos commandes en temps réel</li>
    </ul>
    <p style="text-align: center;">
      <a href="${APP_URL}/products" class="button">Découvrir nos produits</a>
    </p>
    <p>Si vous avez des questions, notre équipe est là pour vous aider.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Bienvenue sur ${APP_NAME} !`,
    html: baseEmailTemplate(content, "Bienvenue"),
  });
}

export async function sendContactConfirmationEmail(
  email: string,
  name: string,
  subject: string
) {
  const content = `
    <h2>Message reçu !</h2>
    <p>Bonjour ${name},</p>
    <p>Nous avons bien reçu votre message concernant : <strong>${subject}</strong></p>
    <p>Notre équipe vous répondra dans les plus brefs délais (généralement sous 24-48h).</p>
    <div class="info-box">
      <p>En attendant, n'hésitez pas à consulter notre <a href="${APP_URL}/faq">FAQ</a> qui répond peut-être déjà à votre question.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Nous avons bien reçu votre message - ${APP_NAME}`,
    html: baseEmailTemplate(content, "Message reçu"),
  });
}

export async function send2FACodeEmail(email: string, code: string) {
  const content = `
    <h2>🔐 Code de vérification</h2>
    <p>Voici votre code de vérification pour vous connecter :</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f8f9fa; padding: 15px 30px; border-radius: 8px; display: inline-block;">
        ${code}
      </span>
    </div>
    <div class="info-box">
      <p><strong>⏰ Ce code expire dans 10 minutes.</strong></p>
      <p>Si vous n'avez pas tenté de vous connecter, changez immédiatement votre mot de passe.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Votre code de vérification - ${APP_NAME}`,
    html: baseEmailTemplate(content, "Code de vérification"),
  });
}

// ==================== INVOICE EMAIL (PDF attached) ====================

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PROCESSING: "En cours de traitement",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export async function sendInvoiceEmail(
  email: string,
  invoiceNumber: string,
  pdfBuffer: Buffer,
  orderId?: string
) {
  const orderLink = orderId
    ? `<p style="text-align: center;"><a href="${APP_URL}/orders/${orderId}" class="button">Voir ma commande</a></p>`
    : "";

  const content = `
    <h2>Votre facture ${invoiceNumber}</h2>
    <p>Bonjour,</p>
    <p>Vous trouverez ci-joint la facture <strong>${invoiceNumber}</strong> correspondant à votre commande.</p>
    <div class="info-box">
      <p>Conservez ce document : il vous sera utile en cas de retour ou de garantie.</p>
    </div>
    ${orderLink}
    <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Facture ${invoiceNumber} - ${APP_NAME}`,
    html: baseEmailTemplate(content, `Facture ${invoiceNumber}`),
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

// ==================== ORDER STATUS CHANGE ====================

export async function sendOrderStatusChangeEmail(
  email: string,
  orderId: string,
  newStatus: string,
  previousStatus?: string
) {
  const orderUrl = `${APP_URL}/orders/${orderId}`;
  const newLabel = ORDER_STATUS_LABELS[newStatus] ?? newStatus;
  const prevLabel = previousStatus
    ? ORDER_STATUS_LABELS[previousStatus] ?? previousStatus
    : null;

  const transition = prevLabel
    ? `<p>Le statut de votre commande <strong>#${orderId}</strong> est passé de <strong>${prevLabel}</strong> à <strong>${newLabel}</strong>.</p>`
    : `<p>Le statut de votre commande <strong>#${orderId}</strong> est maintenant : <strong>${newLabel}</strong>.</p>`;

  const content = `
    <h2>Mise à jour de votre commande</h2>
    ${transition}
    <p style="text-align: center;">
      <a href="${orderUrl}" class="button">Voir ma commande</a>
    </p>
    <div class="info-box">
      <p>Retrouvez l'historique complet de votre commande depuis votre espace client.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Commande #${orderId} : ${newLabel} - ${APP_NAME}`,
    html: baseEmailTemplate(content, "Mise à jour commande"),
  });
}

// ==================== CREDIT NOTE EMAIL ====================

export async function sendCreditNoteEmail(
  email: string,
  creditNumber: string,
  pdfSource: Buffer | { path: string },
  orderId?: string
) {
  const pdfBuffer = Buffer.isBuffer(pdfSource)
    ? pdfSource
    : await readFile(pdfSource.path);

  const orderLink = orderId
    ? `<p style="text-align: center;"><a href="${APP_URL}/orders/${orderId}" class="button">Voir ma commande</a></p>`
    : "";

  const content = `
    <h2>Avoir ${creditNumber}</h2>
    <p>Bonjour,</p>
    <p>Un avoir a été généré pour votre commande. Vous trouverez ci-joint le document <strong>${creditNumber}</strong>.</p>
    <div class="info-box">
      <p>Cet avoir annule ou complète la facture correspondante. Conservez-le avec vos justificatifs comptables.</p>
    </div>
    ${orderLink}
    <p>Pour toute question sur cet avoir, notre équipe reste à votre disposition.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Avoir ${creditNumber} - ${APP_NAME}`,
    html: baseEmailTemplate(content, `Avoir ${creditNumber}`),
    attachments: [
      {
        filename: `${creditNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
