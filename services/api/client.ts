/**
 * Base HTTP client — thin wrapper over fetch.
 * No axios to keep the bundle lean. Swap this file if you need interceptors.
 */
import { useAuthStore } from '@/store/authStore';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

/** Returns the current JWT from the auth store — usable outside React components. */
function getToken(): string | undefined {
  return useAuthStore.getState().token ?? undefined;
}

export class APIError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    message?: string,
  ) {
    super(message ?? `HTTP ${status}: ${body}`);
    this.name = 'APIError';
  }
}

type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = config;
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new APIError(response.status, await response.text());
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(path, { ...config, method: 'GET' }),

  post: <T>(path: string, body: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(path, { ...config, method: 'POST', body }),

  put: <T>(path: string, body: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(path, { ...config, method: 'PUT', body }),

  patch: <T>(path: string, body: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(path, { ...config, method: 'PATCH', body }),

  delete: <T>(path: string, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    request<T>(path, { ...config, method: 'DELETE' }),

  /**
   * Upload a file via multipart/form-data.
   * React Native's fetch supports FormData natively.
   */
  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const token = getToken();
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      // Do NOT set Content-Type — fetch sets it automatically with the correct boundary
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    return response.json() as Promise<T>;
  },
};
