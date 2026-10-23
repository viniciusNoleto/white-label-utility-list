import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appClient } from '@/src/utils/appClient';
import { useAuthStore } from '@/src/resources/auth/stores/useAuthStore';

const okMessage = { 'pt-br': 'ok', 'es-mx': 'ok', 'en-us': 'ok' };
const user = { id: 1, name: 'Ana', email: 'ana@example.com', role: 'admin', status: 'approved' };

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

const fetchMock = vi.fn();

describe('appClient', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    useAuthStore.setState({ user: null, accessToken: 'access-1', refreshToken: 'refresh-1', sessionExpired: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the bearer token and returns the parsed body on success', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, message: okMessage, data: [1] }));

    const res = await appClient.get<number[]>('/api/x');

    expect(res.data).toEqual([1]);
    expect(fetchMock).toHaveBeenCalledWith('/api/x', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer access-1' }),
    }));
  });

  it('serializes the body for post, put and patch and uses DELETE for delete', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ success: true, message: okMessage, data: null }));

    await appClient.post('/api/a', { body: { a: 1 } });
    await appClient.put('/api/b', { body: { b: 2 } });
    await appClient.patch('/api/c', { body: { c: 3 } });
    await appClient.delete('/api/d');

    expect(fetchMock.mock.calls.map(([url, opts]) => [url, opts.method, opts.body])).toEqual([
      ['/api/a', 'POST', '{"a":1}'],
      ['/api/b', 'PUT', '{"b":2}'],
      ['/api/c', 'PATCH', '{"c":3}'],
      ['/api/d', 'DELETE', undefined],
    ]);
  });

  it('throws the body on non-401 errors without refreshing', async () => {
    const error = { success: false, message: okMessage, data: null };
    fetchMock.mockResolvedValueOnce(jsonResponse(error, 422));

    await expect(appClient.get('/api/x')).rejects.toEqual(error);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not try to refresh on auth endpoints', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: false, message: okMessage, data: null }, 401));

    await expect(appClient.post('/api/auth/login', { body: {} })).rejects.toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes the tokens once on 401, retries and queues concurrent requests', async () => {
    let refreshed = false;

    fetchMock.mockImplementation(async (url: string, opts: RequestInit) => {
      if (url === '/api/auth/token/refresh') {
        expect(JSON.parse(opts.body as string)).toEqual({ refresh_token: 'refresh-1' });
        refreshed = true;
        return jsonResponse({ success: true, message: okMessage, data: { user, access_token: 'access-2', refresh_token: 'refresh-2' } });
      }

      const auth = (opts.headers as Record<string, string>).Authorization;

      if (auth === 'Bearer access-2' && refreshed) return jsonResponse({ success: true, message: okMessage, data: url });

      return jsonResponse({ success: false, message: okMessage, data: null }, 401);
    });

    const [a, b] = await Promise.all([appClient.get('/api/a'), appClient.get('/api/b')]);

    expect(a.data).toBe('/api/a');
    expect(b.data).toBe('/api/b');
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/auth/token/refresh')).toHaveLength(1);
    expect(useAuthStore.getState().accessToken).toBe('access-2');
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('marks the session as expired when the refresh fails', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/api/auth/token/refresh') return jsonResponse({ success: false, message: okMessage, data: null }, 401);

      return jsonResponse({ success: false, message: okMessage, data: null }, 401);
    });

    await expect(appClient.get('/api/x')).rejects.toBeTruthy();

    expect(useAuthStore.getState().sessionExpired).toBe(true);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  describe('blob', () => {
    it('returns the blob and the filename from Content-Disposition', async () => {
      fetchMock.mockResolvedValueOnce(new Response('data', { status: 200, headers: { 'Content-Disposition': 'attachment; filename="lista.xlsx"' } }));

      const res = await appClient.blob('/api/export');

      expect(res.filename).toBe('lista.xlsx');
      expect(await res.blob.text()).toBe('data');
    });

    it('defaults the filename and throws the JSON body on error', async () => {
      fetchMock.mockResolvedValueOnce(new Response('data', { status: 200 }));
      expect((await appClient.blob('/api/export')).filename).toBe('download');

      const error = { success: false, message: okMessage, data: null };
      fetchMock.mockResolvedValueOnce(jsonResponse(error, 500));
      await expect(appClient.blob('/api/export')).rejects.toEqual(error);
    });
  });
});
