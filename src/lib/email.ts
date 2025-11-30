import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@althea-systems.com",
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  };

  return transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Vérifiez votre adresse email",
    html: `
      <h1>Bienvenue sur Althea Systems !</h1>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
      <a href="${verifyUrl}">Vérifier mon email</a>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
      <p>Ce lien expire dans 1 heure.</p>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  total: number
) {
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`;

  await sendEmail({
    to: email,
    subject: `Confirmation de commande #${orderId}`,
    html: `
      <h1>Merci pour votre commande !</h1>
      <p>Votre commande #${orderId} a bien été enregistrée.</p>
      <p>Total : ${total.toFixed(2)} €</p>
      <a href="${orderUrl}">Voir ma commande</a>
    `,
  });
}
