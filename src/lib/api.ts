/**
 * Tiny fetch wrapper around the CES backend.
 *
 * Reads the base URL from {@code NEXT_PUBLIC_API_BASE_URL} so it's available
 * in both server and client components. Throws on non-2xx so React Query can
 * surface errors via {@code isError} / {@code error}.
 */
// Browser-facing base — inlined into the client bundle at build time. In prod
// this is the public origin (e.g. https://ces.sarkhan.online) and the reverse
// proxy forwards /api, /uploads to the backend.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ??
  'http://localhost:8080';

// Server-only base — read at runtime inside Server Components. Lets the
// frontend container reach the backend directly over the Docker network
// (e.g. http://backend:8080) instead of hairpinning back through the public
// proxy. Falls back to the public base when unset (dev / single-process).
const SERVER_API_BASE =
  process.env.API_INTERNAL_BASE_URL?.replace(/\/+$/, '') ?? API_BASE;

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  // Don't override Content-Type for FormData — the browser must compute the
  // multipart boundary itself.
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.status, `API ${res.status} on ${path}`, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Used by server-side callers (sitemap). Point at the internal base so it
// resolves over the Docker network in prod.
export const apiBaseUrl = SERVER_API_BASE;

/**
 * Server-side data fetch used by Server Components. Falls back to {@code null}
 * on error so SSR keeps working when the backend is briefly unreachable —
 * client-side React Query then refetches and the user sees the data once it
 * lands. Uses Next's data cache with a short revalidate so admin edits show
 * up within the minute.
 */
export async function serverFetch<T>(
  path: string,
  options: { revalidate?: number } = {},
): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_BASE}${path}`, {
      next: { revalidate: options.revalidate ?? 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
