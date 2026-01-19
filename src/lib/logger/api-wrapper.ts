import { NextRequest, NextResponse } from "next/server";
import { apiLogger } from "./sections";
import { LogMessages } from "./messages";

type ApiHandler<TContext = unknown> = (
  req: NextRequest,
  context: TContext
) => Promise<NextResponse>;

// Wrapper pour logger automatiquement les requêtes API
export function withApiLogger<TContext>(
  handler: ApiHandler<TContext>
): ApiHandler<TContext> {
  return async (req: NextRequest, context: TContext) => {
    const start = Date.now();
    const { method, nextUrl } = req;
    const path = nextUrl.pathname;

    apiLogger.http(LogMessages.api.requeteRecue(method, path), {
      query: Object.fromEntries(nextUrl.searchParams),
    });

    try {
      const response = await handler(req, context);
      const duration = Date.now() - start;

      apiLogger.info(
        LogMessages.api.reponseEnvoyee(response.status, duration),
        {
          method,
          path,
          status: response.status,
          duration,
        }
      );

      return response;
    } catch (error) {
      const duration = Date.now() - start;
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";

      apiLogger.error(LogMessages.api.erreurServeur(message), {
        method,
        path,
        duration,
        error: message,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  };
}

// Helper pour créer une réponse d'erreur loggée
export function loggedErrorResponse(
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
) {
  apiLogger.error(message, { status, ...details });
  return NextResponse.json({ error: message }, { status });
}

// Helper pour créer une réponse de succès loggée
export function loggedSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  if (message) {
    apiLogger.info(message);
  }
  return NextResponse.json(data, { status });
}
