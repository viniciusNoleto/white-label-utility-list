import { ApiMessage } from '@/src/shared/types/api';

export type AppApiResponse<T> = {
  success: boolean;
  message: ApiMessage;
  data: T;
};

async function request<T>(url: string, options?: RequestInit): Promise<AppApiResponse<T>> {
  const res = await fetch(url, options);
  const data: AppApiResponse<T> = await res.json();
  if (!data.success) throw data;
  return data;
}

export const appClient = {
  get<T>(url: string, options?: { signal?: AbortSignal }): Promise<AppApiResponse<T>> {
    return request<T>(url, { signal: options?.signal });
  },
  post<T>(url: string, options: { body: any; signal?: AbortSignal }): Promise<AppApiResponse<T>> {
    return request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body),
      signal: options.signal,
    });
  },
  put<T>(url: string, options: { body: any }): Promise<AppApiResponse<T>> {
    return request<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body),
    });
  },
  patch<T>(url: string, options: { body: any }): Promise<AppApiResponse<T>> {
    return request<T>(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options.body),
    });
  },
  delete<T>(url: string): Promise<AppApiResponse<T>> {
    return request<T>(url, { method: 'DELETE' });
  },
};
