/**
 * POST /api/chat
 *
 * Streaming endpoint du chatbot Althea Systems. Persiste la conversation et
 * les messages en base (ChatbotConversation + ChatbotMessage).
 *
 * Body (JSON) :
 *   - messages   : Array<{ role: "user" | "assistant" | "system", content: string }>
 *                  historique complet côté client (incluant le dernier user message).
 *   - sessionId  : string (optionnel mais recommandé) — UUID/cuid persistant côté
 *                  client pour retrouver la conversation. Si absent, un nouvel
 *                  identifiant est généré côté serveur mais sans lien stable.
 *   - escalate   : boolean (optionnel) — si true, la conversation est marquée
 *                  ESCALATED (support humain) et un log admin est émis.
 *   - userEmail  : string (optionnel) — email capturé par le bot pour rappel.
 *
 * Réponse : text/plain stream (identique à l'existant côté frontend). Le message
 * assistant est persisté à la fin du stream avec le texte effectivement envoyé.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/redis";
import { apiLogger } from "@/lib/logger/sections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-4o-mini";
const MAX_MESSAGES = 30;
const MAX_CONTENT_LENGTH = 4000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;

const ESCALATION_KEYWORDS = [
  "parler a un humain",
  "parler à un humain",
  "support humain",
  "conseiller humain",
  "agent humain",
  "contacter le support",
  "contacter un conseiller",
];

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Althea Systems, un e-commerce francais specialise dans les equipements medicaux professionnels.

Ton role : aider les visiteurs (medecins, infirmiers, kinesitherapeutes, hopitaux, pharmacies, cliniques, EHPAD) a :
- Trouver les produits adaptes a leurs besoins
- Repondre aux questions sur les categories de produits
- Expliquer les conditions generales de livraison et de retour
- Orienter vers la bonne categorie ou vers la recherche
- Fournir des informations claires sur la commande et le suivi

Regles strictes :
- Reponds toujours en francais, de maniere claire, professionnelle et chaleureuse
- N'invente JAMAIS de prix, de references ou de disponibilites de stock : oriente vers la page produit ou la recherche
- Si tu ne connais pas un produit precis, suggere d'utiliser la recherche du site ou de contacter l'equipe via le formulaire de contact
- Ne donne jamais de conseil medical : ton role est commercial et informatif, pas clinique
- Reste concis : privilegie des reponses courtes et structurees (listes, paragraphes courts)
- Si la question sort du cadre d'Althea Systems, recentre gentiment vers les equipements medicaux`;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(MAX_CONTENT_LENGTH),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(MAX_MESSAGES),
  sessionId: z.string().min(8).max(128).optional(),
  escalate: z.boolean().optional(),
  userEmail: z.string().email().max(200).optional(),
});

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function detectEscalation(content: string): boolean {
  const normalized = content
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return ESCALATION_KEYWORDS.some((kw) => normalized.includes(kw));
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    apiLogger.warn("Chatbot request received but OPENAI_API_KEY is not set", {
      ip: clientIP,
    });
    return NextResponse.json(
      {
        error: "Service Unavailable",
        message: "Chatbot temporairement indisponible.",
      },
      { status: 503 }
    );
  }

  const rateLimitKey = `chat:${clientIP}`;
  try {
    const rl = await checkRateLimit(
      rateLimitKey,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW_SECONDS
    );
    if (!rl.allowed) {
      apiLogger.warn("Chatbot rate limit exceeded", {
        ip: clientIP,
        limit: RATE_LIMIT_MAX,
        window: RATE_LIMIT_WINDOW_SECONDS,
      });
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message:
            "Vous envoyez trop de messages. Merci de patienter quelques instants.",
          retryAfter: rl.resetIn,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.resetIn),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": String(rl.remaining),
            "X-RateLimit-Reset": String(
              Math.floor(Date.now() / 1000) + rl.resetIn
            ),
          },
        }
      );
    }
  } catch (error) {
    apiLogger.error("Chatbot rate limit check failed (fail-open)", {
      ip: clientIP,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  let payload: z.infer<typeof chatRequestSchema>;
  try {
    const json = await request.json();
    payload = chatRequestSchema.parse(json);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")
        : "Corps de requete invalide";
    return NextResponse.json(
      { error: "Bad Request", message },
      { status: 400 }
    );
  }

  const sanitizedMessages = payload.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0);

  if (sanitizedMessages.length === 0) {
    return NextResponse.json(
      { error: "Bad Request", message: "Aucun message valide." },
      { status: 400 }
    );
  }

  // Dernier message USER à persister
  const lastUserMessage = [...sanitizedMessages]
    .reverse()
    .find((m) => m.role === "user");

  // Récupération de la session NextAuth (lie la conversation si user loggé)
  let userId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    userId = session?.user?.id ?? null;
  } catch (error) {
    apiLogger.warn("Chatbot: getServerSession failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  // Détection d'escalade : flag explicite OU mot-clé dans le dernier user msg
  const escalateRequested =
    payload.escalate === true ||
    (lastUserMessage ? detectEscalation(lastUserMessage.content) : false);

  const sessionId = payload.sessionId ?? randomUUID();

  // Upsert conversation + persistance du message USER (avant le stream).
  // En cas d'échec DB, on log mais on n'interrompt PAS la réponse chatbot :
  // le streaming prime sur la persistance côté UX. On sauvegardera la suite
  // best-effort.
  let conversationId: string | null = null;
  try {
    const conversation = await prisma.chatbotConversation.upsert({
      where: { sessionId },
      create: {
        sessionId,
        userId,
        userEmail: payload.userEmail,
        status: escalateRequested ? "ESCALATED" : "ACTIVE",
      },
      update: {
        // Ne rétrograde jamais un CLOSED vers ACTIVE automatiquement.
        ...(userId ? { userId } : {}),
        ...(payload.userEmail ? { userEmail: payload.userEmail } : {}),
        ...(escalateRequested ? { status: "ESCALATED" as const } : {}),
      },
    });
    conversationId = conversation.id;

    if (lastUserMessage) {
      await prisma.chatbotMessage.create({
        data: {
          conversationId,
          role: "USER",
          content: lastUserMessage.content,
        },
      });
    }

    if (escalateRequested) {
      apiLogger.warn("Chatbot conversation ESCALATED", {
        conversationId,
        sessionId,
        userId,
        ip: clientIP,
      });
    }
  } catch (error) {
    apiLogger.error("Chatbot: conversation persistence failed", {
      sessionId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  const client = new OpenAI({ apiKey });

  apiLogger.info("Chatbot request", {
    ip: clientIP,
    sessionId,
    conversationId,
    userId,
    messagesCount: sanitizedMessages.length,
    model: MODEL,
    escalated: escalateRequested,
  });

  const startedAt = Date.now();

  try {
    const stream = await client.chat.completions.create({
      model: MODEL,
      stream: true,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...sanitizedMessages,
      ],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let totalChars = 0;
        let accumulated = "";
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              totalChars += delta.length;
              accumulated += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }
          apiLogger.info("Chatbot response streamed", {
            ip: clientIP,
            sessionId,
            conversationId,
            model: MODEL,
            durationMs: Date.now() - startedAt,
            responseChars: totalChars,
          });
        } catch (error) {
          apiLogger.error("Chatbot streaming error", {
            ip: clientIP,
            sessionId,
            conversationId,
            error: error instanceof Error ? error.message : "Unknown error",
            durationMs: Date.now() - startedAt,
          });
          try {
            const fallback =
              "\n\n[Desole, une erreur est survenue. Merci de reessayer.]";
            accumulated += fallback;
            controller.enqueue(encoder.encode(fallback));
          } catch {
            // controller may already be closed
          }
        } finally {
          controller.close();

          // Persiste le message ASSISTANT avec le texte effectivement envoyé
          // au client. Best-effort : n'échoue jamais le stream.
          if (conversationId && accumulated.length > 0) {
            prisma.chatbotMessage
              .create({
                data: {
                  conversationId,
                  role: "ASSISTANT",
                  content: accumulated,
                },
              })
              .catch((err: unknown) => {
                apiLogger.error("Chatbot: assistant message persist failed", {
                  conversationId,
                  sessionId,
                  error:
                    err instanceof Error ? err.message : "Unknown error",
                });
              });
          }
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "X-Chatbot-Session-Id": sessionId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    apiLogger.error("Chatbot OpenAI call failed", {
      ip: clientIP,
      sessionId,
      conversationId,
      error: message,
      durationMs: Date.now() - startedAt,
    });

    const isAuth =
      error instanceof OpenAI.APIError && error.status === 401;
    if (isAuth) {
      return NextResponse.json(
        {
          error: "Service Unavailable",
          message: "Chatbot temporairement indisponible.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          "Une erreur est survenue lors de la generation de la reponse.",
      },
      { status: 500 }
    );
  }
}
