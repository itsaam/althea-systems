import { NextRequest } from "next/server";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface MakeRequestInit {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
}

export function makeRequest(
  url: string,
  init: MakeRequestInit = {}
): NextRequest {
  const { method = "GET", body, headers } = init;
  const fullUrl = url.startsWith("http") ? url : `http://localhost${url}`;
  const requestInit: Record<string, unknown> = { method };
  if (headers) requestInit.headers = headers;
  if (body !== undefined) {
    requestInit.body = typeof body === "string" ? body : JSON.stringify(body);
    requestInit.headers = {
      "content-type": "application/json",
      ...(headers ?? {}),
    };
  }
  return new NextRequest(
    fullUrl,
    requestInit as ConstructorParameters<typeof NextRequest>[1]
  );
}

export async function readJson<T = unknown>(
  res: Response | { json: () => Promise<unknown> }
): Promise<T> {
  return (await res.json()) as T;
}

export function routeContext(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}
