import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  withApiLogger,
  loggedErrorResponse,
  loggedSuccessResponse,
  apiLogger,
} from "@/lib/logger/exports";

export const dynamic = "force-dynamic";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Althea Systems";
const emailsEnabled = () => process.env.EMAILS_ENABLED !== "false";

const replySchema = z.object({
  subject: z.string().trim().min(1, "Sujet requis").max(200),
  body: z.string().trim().min(1, "Message requis").max(10_000),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

function buildReplyHtml(
  recipientName: string,
  originalSubject: string,
  originalMessage: string,
  replyBody: string
): string {
  const escaped = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const replyHtml = escaped(replyBody).replace(/\r?\n/g, "<br>");
  const originalHtml = escaped(originalMessage).replace(/\r?\n/g, "<br>");

  return `
    <h2>Réponse à votre message</h2>
    <p>Bonjour ${escaped(recipientName)},</p>
    <p>Merci de nous avoir contactés. Voici notre réponse à votre message concernant :
      <strong>${escaped(originalSubject)}</strong>.
    </p>
    <div style="margin: 24px 0; padding: 16px 20px; background-color: #f0f9fa; border-left: 3px solid #00a8b5;">
      <p style="margin: 0; color: #003d5c;">${replyHtml}</p>
    </div>
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #dfe4ea;">
      <p style="font-size: 13px; color: #6b7885;">Votre message initial :</p>
      <p style="font-size: 13px; color: #6b7885; font-style: italic;">${originalHtml}</p>
    </div>
    <p>Si vous avez d'autres questions, n'hésitez pas à nous répondre directement à cet email.</p>
  `;
}

function baseEmailWrapper(content: string, title: string): string {
  const APP_URL =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.7; color: #1a1a1a; margin: 0; padding: 0; background-color: #f4f6f8; }
    .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .wrapper { background-color: #ffffff; border: 1px solid #dfe4ea; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 61, 92, 0.06); }
    .accent-bar { height: 4px; background: linear-gradient(90deg, #003d5c 0%, #00a8b5 100%); font-size: 0; line-height: 0; }
    .header { padding: 32px 40px; background-color: #003d5c; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px; }
    .content h2 { color: #003d5c; margin: 0 0 24px 0; font-size: 20px; }
    .content p { margin: 0 0 16px 0; color: #4a4a4a; font-size: 15px; }
    .footer { padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #dfe4ea; font-size: 13px; color: #6b7885; }
    .footer a { color: #003d5c; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="wrapper">
      <div class="accent-bar">&nbsp;</div>
      <div class="header"><h1>${APP_NAME}</h1></div>
      <div class="content">${content}</div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
        <p style="margin-top: 8px;"><a href="${APP_URL}">Site web</a> &middot; <a href="${APP_URL}/contact">Contact</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export const POST = withApiLogger(async (
  req: NextRequest,
  context: unknown
) => {
  let currentId = "unknown";
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return loggedErrorResponse("Action réservée aux administrateurs", 403);
    }

    const { id } = await (context as RouteContext).params;
    currentId = id;

    const body = await req.json();
    const { subject, body: replyBody } = replySchema.parse(body);

    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) return loggedErrorResponse("Message introuvable", 404);

    if (!emailsEnabled()) {
      apiLogger.warn(
        `Reply email skipped for message ${id}: EMAILS_ENABLED=false`
      );
      return loggedErrorResponse(
        "L'envoi d'emails est désactivé sur cet environnement",
        503
      );
    }

    const contentHtml = buildReplyHtml(
      message.name,
      message.subject,
      message.message,
      replyBody
    );
    const html = baseEmailWrapper(contentHtml, subject);

    try {
      await sendEmail({
        to: message.email,
        subject,
        html,
      });
    } catch (emailError) {
      const emailMsg =
        emailError instanceof Error ? emailError.message : "Erreur inconnue";
      apiLogger.error(
        `Échec envoi réponse au message ${id} (${message.email}): ${emailMsg}`
      );
      return loggedErrorResponse(
        "Impossible d'envoyer l'email. Veuillez réessayer.",
        502
      );
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });

    apiLogger.info(
      `Réponse envoyée au message ${id} (${message.email}) par ${session.user.email}`
    );

    return loggedSuccessResponse(
      { message: updated },
      "Réponse envoyée avec succès"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return loggedErrorResponse(
        `Données invalides: ${error.issues.map((i) => i.message).join(", ")}`,
        400
      );
    }
    const errMsg = error instanceof Error ? error.message : "Erreur inconnue";
    apiLogger.error(`Erreur POST reply message [${currentId}]: ${errMsg}`);
    return loggedErrorResponse(`Erreur envoi réponse: ${errMsg}`, 500);
  }
});
