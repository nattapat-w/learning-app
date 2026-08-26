/** Browser-only API client — always uses `/api` proxy (same-origin cookies). */

export class ApiClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.message === "string") return body.message;
    if (Array.isArray(body?.message)) return body.message.join(", ");
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`/api${normalized}`, {
    ...init,
    credentials: "include",
    headers: init?.headers,
  });

  if (!res.ok) {
    throw new ApiClientError(res.status, await parseErrorMessage(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function apiClientFormData<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`/api${normalized}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new ApiClientError(res.status, await parseErrorMessage(res));
  }

  return res.json() as Promise<T>;
}
