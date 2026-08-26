import { cookies } from "next/headers";
import { getApiUrl } from "../../../lib/api-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
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

/** Headers safe to forward to the browser (avoid gzip/length mismatches from streaming). */
function buildResponseHeaders(upstream: Response): Headers {
  const out = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) {
    out.set("content-type", contentType);
  }

  const setCookie = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookie) {
    out.append("set-cookie", cookie);
  }
  if (setCookie.length === 0) {
    const single = upstream.headers.get("set-cookie");
    if (single) {
      out.set("set-cookie", single);
    }
  }

  return out;
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

  const headers = new Headers();
  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const hasBody =
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.body !== null;

  let body: BodyInit | undefined;
  if (hasBody) {
    if (isMultipart) {
      const incomingForm = await request.formData();
      const outgoingForm = new FormData();
      for (const [key, value] of incomingForm.entries()) {
        if (typeof value === "string") {
          outgoingForm.append(key, value);
        } else {
          outgoingForm.append(key, value, value.name);
        }
      }
      body = outgoingForm;
    } else if (contentType.includes("application/json")) {
      headers.set("content-type", contentType);
      const buf = await request.arrayBuffer();
      if (buf.byteLength > 0) body = buf;
    } else {
      if (contentType) headers.set("content-type", contentType);
      const buf = await request.arrayBuffer();
      if (buf.byteLength > 0) body = buf;
    }
  }

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseBody = await upstream.arrayBuffer();
    return new Response(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: buildResponseHeaders(upstream),
    });
  } catch {
    return Response.json(
      {
        statusCode: 502,
        message: `API unreachable at ${apiUrl}. Is the API running?`,
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
