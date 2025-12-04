import { Resend } from "resend";

// ==================== CONFIGURATION ====================

// Lazy initialization pour éviter les erreurs au build
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Althea Systems";
// Utiliser NEXTAUTH_URL en priorité (défini en prod), sinon fallback sur localhost
const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// ==================== TYPES ====================

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
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
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #333;
      margin-top: 0;
      font-size: 22px;
    }
    .content p {
      margin: 16px 0;
      color: #555;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .order-summary {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      margin: 20px 0;
    }
    .order-summary table {
      width: 100%;
      border-collapse: collapse;
    }
    .order-summary th,
    .order-summary td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    .order-summary th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .order-summary .total {
      font-weight: 700;
      font-size: 18px;
      background-color: #f8f9fa;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>${APP_NAME}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. Tous droits réservés.</p>
        <p>
          <a href="${APP_URL}">Visiter notre site</a> | 
          <a href="${APP_URL}/contact">Contact</a> |
          <a href="${APP_URL}/mentions-legales">Mentions légales</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// ==================== SEND EMAIL FUNCTION ====================

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const { data, error } = await getResend().emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }

  return data;
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
