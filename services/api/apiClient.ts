import { ENV } from '@/config/env';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenStorage';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    const msg = typeof body === 'object' && body && 'message' in body
      ? (body as { message: string }).message
      : `Request failed with status ${status}`;
    super(msg);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let onLogout: (() => void) | null = null;

export function setOnLogout(callback: () => void) {
  onLogout = callback;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${ENV.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const json = await res.json();
    const data = json.data ?? json;
    await saveTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${ENV.API_URL}${path}`;
  const timeout = options.timeout ?? Number(ENV.API_TIMEOUT);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (!options.skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    // Handle 401 - try refresh
    if (res.status === 401 && !options.skipAuth) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
      }

      const refreshed = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (refreshed) {
        // Retry with new token
        return request<T>(method, path, body, options);
      }

      // Refresh failed - logout
      await clearTokens();
      onLogout?.();
      throw new ApiError(401, { message: 'Session expired. Please login again.' });
    }

    // Handle no-content responses
    if (res.status === 204) return undefined as T;

    const json = await res.json();

    if (!res.ok) {
      throw new ApiError(res.status, json);
    }

    // Unwrap TransformInterceptor wrapper: { success, data, timestamp }
    return (json.data !== undefined ? json.data : json) as T;
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(0, { message: 'Request timed out' });
    }
    throw new ApiError(0, { message: 'Network error. Please check your connection.' });
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
