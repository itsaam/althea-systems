import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { checkRateLimit } from "@/lib/redis";
import { apiLogger } from "@/lib/logger/sections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-4o-mini";
const MAX_MESSAGES = 30;
const MAX_CONTENT_LENGTH = 4000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;

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
});

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
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

  const client = new OpenAI({ apiKey });

  apiLogger.info("Chatbot request", {
    ip: clientIP,
    messagesCount: sanitizedMessages.length,
    model: MODEL,
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
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              totalChars += delta.length;
              controller.enqueue(encoder.encode(delta));
            }
          }
          apiLogger.info("Chatbot response streamed", {
            ip: clientIP,
            model: MODEL,
            durationMs: Date.now() - startedAt,
            responseChars: totalChars,
          });
        } catch (error) {
          apiLogger.error("Chatbot streaming error", {
            ip: clientIP,
            error: error instanceof Error ? error.message : "Unknown error",
            durationMs: Date.now() - startedAt,
          });
          try {
            controller.enqueue(
              encoder.encode(
                "\n\n[Desole, une erreur est survenue. Merci de reessayer.]"
              )
            );
          } catch {
            // controller may already be closed
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    apiLogger.error("Chatbot OpenAI call failed", {
      ip: clientIP,
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
