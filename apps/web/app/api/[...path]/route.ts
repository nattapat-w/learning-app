import { cookies } from "next/headers";
import { getApiUrl } from "../../../lib/api-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Allow slow Render cold starts + image upload through the proxy (Vercel cap may still apply on free tier). */
export const maxDuration = 60;

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
  headers.delete("cookie");

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const hasBody =
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.body !== null;

  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  let body: BodyInit | null | undefined;
  if (hasBody) {
    if (isMultipart) {
      // Stream multipart bodies — arrayBuffer() breaks boundaries for multer.
      body = request.body;
      headers.delete("content-length");
    } else {
      const buf = await request.arrayBuffer();
      body = buf.byteLength > 0 ? buf : undefined;
      headers.delete("content-length");
    }
  }

  const fetchInit: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (body !== null && body !== undefined) {
    fetchInit.body = body;
    if (isMultipart) {
      fetchInit.duplex = "half";
    }
  }

  try {
    const upstream = await fetch(target, fetchInit);

    const responseHeaders = new Headers(upstream.headers);
    // Hop-by-hop — can break Next response parsing.
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("connection");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
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
