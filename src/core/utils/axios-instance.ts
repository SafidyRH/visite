import { supabase } from '../services/supabase-client';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: JsonValue;
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (data.session?.access_token) {
    headers.set('Authorization', `Bearer ${data.session.access_token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
