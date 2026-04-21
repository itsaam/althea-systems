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
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1d1619;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f1f2;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border:1px solid #d6cdd1;">
          <!-- Eyebrow -->
          <tr>
            <td style="padding:28px 40px 0 40px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.22em;color:#6d5c63;text-transform:uppercase;">
              — ${APP_NAME}
            </td>
          </tr>
          <!-- Wordmark -->
          <tr>
            <td style="padding:12px 40px 32px 40px;">
              <div style="font-size:28px;font-weight:700;letter-spacing:-0.5px;color:#1d1619;line-height:1;">althea.</div>
              <div style="height:3px;width:32px;background-color:#5b12ed;margin-top:20px;"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:0 40px 40px 40px;font-size:15px;line-height:1.65;color:#1d1619;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f4f1f2;border-top:1px solid #d6cdd1;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.18em;color:#6d5c63;text-transform:uppercase;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">© ${year} · ${APP_NAME}</td>
                  <td align="right" style="vertical-align:middle;">
                    <a href="${APP_URL}" style="color:#6d5c63;text-decoration:none;margin-left:16px;">Site</a>
                    <a href="${APP_URL}/contact" style="color:#6d5c63;text-decoration:none;margin-left:16px;">Contact</a>
                    <a href="${APP_URL}/mentions-legales" style="color:#6d5c63;text-decoration:none;margin-left:16px;">Mentions</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="margin-top:16px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:9px;letter-spacing:0.22em;color:#6d5c63;text-transform:uppercase;">
          Medical · Systems
        </div>
      </td>
    </tr>
  </table>

  <style>
    h1, h2, h3 { color:#1d1619; font-weight:700; letter-spacing:-0.3px; margin:0 0 16px 0; }
    h2 { font-size:22px; line-height:1.2; margin-bottom:20px; }
    h3 { font-size:14px; text-transform:uppercase; letter-spacing:0.16em; color:#6d5c63; margin-top:28px; }
    p { margin:0 0 14px 0; color:#1d1619; }
    a { color:#5b12ed; text-decoration:underline; text-underline-offset:2px; }
    strong { color:#1d1619; font-weight:600; }
    ul { margin:0 0 16px 0; padding-left:20px; color:#1d1619; }
    li { margin-bottom:6px; }
    .button {
      display:inline-block;
      padding:14px 24px;
      background-color:#1d1619;
      color:#ffffff !important;
      text-decoration:none !important;
      font-family:'SF Mono',Menlo,Consolas,monospace;
      font-size:11px;
      letter-spacing:0.18em;
      text-transform:uppercase;
      margin:12px 0 24px 0;
    }
    .button:hover { background-color:#5b12ed; }
    .info-box {
      border-left:2px solid #5b12ed;
      padding:14px 18px;
      margin:24px 0;
      background-color:#f4f1f2;
      font-size:13px;
      line-height:1.55;
    }
    .info-box p { margin:0; color:#1d1619; }
    .info-box p + p { margin-top:6px; }
    .order-summary {
      border:1px solid #d6cdd1;
      margin:24px 0;
      font-size:13px;
    }
    .order-summary table { width:100%; border-collapse:collapse; }
    .order-summary th, .order-summary td {
      padding:10px 14px;
      text-align:left;
      border-bottom:1px solid #d6cdd1;
    }
    .order-summary th {
      background-color:#1d1619;
      color:#ffffff;
      font-family:'SF Mono',Menlo,Consolas,monospace;
      font-size:10px;
      letter-spacing:0.14em;
      text-transform:uppercase;
      font-weight:600;
    }
    .order-summary tr:last-child td { border-bottom:none; }
    .order-summary .total td {
      font-weight:700;
      background-color:#f4f1f2;
      color:#1d1619;
    }
    code {
      background-color:#f4f1f2;
      padding:2px 6px;
      font-family:'SF Mono',Menlo,Consolas,monospace;
      font-size:12px;
      color:#5b12ed;
    }
  </style>
</body>
</html>`;
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
