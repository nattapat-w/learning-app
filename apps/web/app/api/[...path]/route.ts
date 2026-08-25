import { cookies } from "next/headers";
import { getApiUrl } from "../../../lib/api-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };

function missingApiUrlResponse(): Response {
  return Response.json(
    {
      statusCode: 503,
      message:
        "API_URL is not set on Vercel. Add it for Production (not Development only) and redeploy.",
    },
    { status: 503 },
  );
}

async function proxyRequest(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return missingApiUrlResponse();
  }

  const { path } = await context.params;
  const pathname = path.join("/");
  const incoming = new URL(request.url);
  const target = `${apiUrl}/${pathname}${incoming.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const hasBody =
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.body !== null;

  let body: ArrayBuffer | undefined;
  if (hasBody) {
    body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: "manual",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    });
  } catch {
    return Response.json(
      {
        statusCode: 502,
        message: `API unreachable at ${apiUrl}. Check Render service is running.`,
      },
      { status: 502 },
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}
