import { api, ApiError, setOnLogout } from '@/services/api/apiClient';
import * as tokenStorage from '@/services/api/tokenStorage';

// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock('@/services/api/tokenStorage');
jest.mock('@/config/env', () => ({
  ENV: {
    API_URL: 'http://test-api.com/api/v1',
    API_TIMEOUT: '5000',
  },
}));

const mockGetAccessToken = tokenStorage.getAccessToken as jest.Mock;
const mockGetRefreshToken = tokenStorage.getRefreshToken as jest.Mock;
const mockSaveTokens = tokenStorage.saveTokens as jest.Mock;
const mockClearTokens = tokenStorage.clearTokens as jest.Mock;

// Helper to build a mock Response
function mockResponse(
  body: unknown,
  status = 200,
  ok = status >= 200 && status < 300,
): Response {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  mockGetAccessToken.mockResolvedValue('token-abc');
  mockGetRefreshToken.mockResolvedValue(null);
  mockSaveTokens.mockResolvedValue(undefined);
  mockClearTokens.mockResolvedValue(undefined);
});

// ==================== ApiError ====================

describe('ApiError', () => {
  it('extracts message from body.message when present', () => {
    const err = new ApiError(400, { message: 'Bad request' });
    expect(err.message).toBe('Bad request');
  });

  it('falls back to generic message when body has no message', () => {
    const err = new ApiError(500, { code: 'ERR' });
    expect(err.message).toBe('Request failed with status 500');
  });

  it('falls back to generic message when body is a string', () => {
    const err = new ApiError(404, 'not found');
    expect(err.message).toBe('Request failed with status 404');
  });

  it('falls back to generic message when body is null', () => {
    const err = new ApiError(503, null);
    expect(err.message).toBe('Request failed with status 503');
  });

  it('sets name to ApiError', () => {
    const err = new ApiError(400, {});
    expect(err.name).toBe('ApiError');
  });

  it('stores status as a public field', () => {
    const err = new ApiError(422, {});
    expect(err.status).toBe(422);
  });

  it('stores body as a public field', () => {
    const body = { message: 'Oops' };
    const err = new ApiError(400, body);
    expect(err.body).toBe(body);
  });
});

// ==================== HTTP methods ====================

describe('api.get', () => {
  it('calls fetch with GET method and correct URL', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'result' }));

    await api.get('/deliveries');

    expect(fetch).toHaveBeenCalledWith(
      'http://test-api.com/api/v1/deliveries',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('does not send a body', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'result' }));

    await api.get('/deliveries');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: undefined }),
    );
  });
});

describe('api.post', () => {
  it('calls fetch with POST method and JSON-stringified body', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'created' }));

    await api.post('/deliveries', { packages: 'Box' });

    expect(fetch).toHaveBeenCalledWith(
      'http://test-api.com/api/v1/deliveries',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ packages: 'Box' }),
      }),
    );
  });

  it('sends no body when none provided', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'ok' }));

    await api.post('/auth/logout');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: undefined }),
    );
  });
});

describe('api.patch', () => {
  it('calls fetch with PATCH method', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'updated' }));

    await api.patch('/users/me', { name: 'Ahmad' });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});

describe('api.put', () => {
  it('calls fetch with PUT method', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'replaced' }));

    await api.put('/resource/1', { value: 'x' });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PUT' }),
    );
  });
});

describe('api.delete', () => {
  it('calls fetch with DELETE method and no body', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: null }, 200));

    await api.delete('/payment-methods/1');

    expect(fetch).toHaveBeenCalledWith(
      'http://test-api.com/api/v1/payment-methods/1',
      expect.objectContaining({ method: 'DELETE', body: undefined }),
    );
  });
});

// ==================== Auth headers ====================

describe('auth headers', () => {
  it('includes Authorization Bearer header when token exists', async () => {
    mockGetAccessToken.mockResolvedValue('my-token');
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'ok' }));

    await api.get('/protected');

    const callHeaders = (fetch as jest.Mock).mock.calls[0][1].headers;
    expect(callHeaders['Authorization']).toBe('Bearer my-token');
  });

  it('omits Authorization header when skipAuth is true', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'ok' }));

    await api.post('/auth/login', {}, { skipAuth: true });

    const callHeaders = (fetch as jest.Mock).mock.calls[0][1].headers;
    expect(callHeaders['Authorization']).toBeUndefined();
    expect(mockGetAccessToken).not.toHaveBeenCalled();
  });

  it('omits Authorization header when no token is stored', async () => {
    mockGetAccessToken.mockResolvedValue(null);
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'ok' }));

    await api.get('/protected');

    const callHeaders = (fetch as jest.Mock).mock.calls[0][1].headers;
    expect(callHeaders['Authorization']).toBeUndefined();
  });

  it('merges custom headers with defaults', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ data: 'ok' }));

    await api.get('/protected', { headers: { 'X-Custom': 'value' } });

    const callHeaders = (fetch as jest.Mock).mock.calls[0][1].headers;
    expect(callHeaders['X-Custom']).toBe('value');
    expect(callHeaders['Content-Type']).toBe('application/json');
  });
});

// ==================== Response handling ====================

describe('response handling', () => {
  it('unwraps json.data when response has the envelope wrapper', async () => {
    (fetch as jest.Mock).mockResolvedValue(
      mockResponse({ data: { id: '1', name: 'Box' }, success: true, timestamp: '...' }),
    );

    const result = await api.get('/deliveries/1');

    expect(result).toEqual({ id: '1', name: 'Box' });
  });

  it('returns raw json when json.data is undefined', async () => {
    (fetch as jest.Mock).mockResolvedValue(
      mockResponse({ id: '1', name: 'Box' }),
    );

    const result = await api.get('/deliveries/1');

    expect(result).toEqual({ id: '1', name: 'Box' });
  });

  it('returns undefined for 204 No Content responses', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse(null, 204));

    const result = await api.delete('/resource/1');

    expect(result).toBeUndefined();
  });
});

// ==================== Error handling ====================

describe('error handling', () => {
  it('throws ApiError with parsed json body for 400 responses', async () => {
    (fetch as jest.Mock).mockResolvedValue(
      mockResponse({ message: 'Bad request' }, 400, false),
    );

    await expect(api.get('/bad')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Bad request',
    });
  });

  it('throws ApiError with parsed json body for 500 responses', async () => {
    (fetch as jest.Mock).mockResolvedValue(
      mockResponse({ message: 'Server error' }, 500, false),
    );

    await expect(api.get('/bad')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    });
  });

  it('throws ApiError with timeout message when request is aborted', async () => {
    (fetch as jest.Mock).mockRejectedValue(
      Object.assign(new Error('aborted'), { name: 'AbortError' }),
    );

    await expect(api.get('/slow', { timeout: 1 })).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'Request timed out',
    });
  });

  it('throws ApiError with network error message on fetch failure', async () => {
    (fetch as jest.Mock).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.get('/any')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'Network error. Please check your connection.',
    });
  });
});

// ==================== 401 refresh flow ====================

describe('401 token refresh flow', () => {
  it('calls refreshAccessToken using the stored refresh token on 401', async () => {
    mockGetRefreshToken.mockResolvedValue('refresh-token');
    mockSaveTokens.mockResolvedValue(undefined);

    // First call: 401. Refresh call: 200 with new tokens. Retry call: 200 success.
    (fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse({}, 401, false))          // original → 401
      .mockResolvedValueOnce(
        mockResponse({ accessToken: 'new-access', refreshToken: 'new-refresh' }, 200), // refresh
      )
      .mockResolvedValueOnce(mockResponse({ data: 'ok' }, 200));    // retry

    await api.get('/protected');

    expect(mockGetRefreshToken).toHaveBeenCalled();
  });

  it('saves new tokens and retries the original request on successful refresh', async () => {
    mockGetRefreshToken.mockResolvedValue('refresh-token');

    (fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse({}, 401, false))
      .mockResolvedValueOnce(
        mockResponse({ accessToken: 'new-access', refreshToken: 'new-refresh' }, 200),
      )
      .mockResolvedValueOnce(mockResponse({ data: 'retried-result' }, 200));

    const result = await api.get('/protected');

    expect(mockSaveTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
    expect(result).toBe('retried-result');
  });

  it('clears tokens and calls onLogout when no refresh token is stored', async () => {
    mockGetRefreshToken.mockResolvedValue(null);
    const onLogout = jest.fn();
    setOnLogout(onLogout);

    (fetch as jest.Mock).mockResolvedValue(mockResponse({}, 401, false));

    await expect(api.get('/protected')).rejects.toMatchObject({
      status: 401,
      message: 'Session expired. Please login again.',
    });

    expect(mockClearTokens).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalled();
  });

  it('clears tokens and calls onLogout when refresh endpoint returns non-ok', async () => {
    mockGetRefreshToken.mockResolvedValue('stale-refresh');
    const onLogout = jest.fn();
    setOnLogout(onLogout);

    (fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse({}, 401, false))     // original
      .mockResolvedValueOnce(mockResponse({}, 401, false));    // refresh fails

    await expect(api.get('/protected')).rejects.toMatchObject({ status: 401 });

    expect(mockClearTokens).toHaveBeenCalled();
    expect(onLogout).toHaveBeenCalled();
  });

  it('does not trigger refresh flow when skipAuth is true', async () => {
    (fetch as jest.Mock).mockResolvedValue(mockResponse({ message: 'Unauthorized' }, 401, false));

    await expect(api.post('/auth/login', {}, { skipAuth: true })).rejects.toMatchObject({
      status: 401,
    });

    // refresh token should never be checked
    expect(mockGetRefreshToken).not.toHaveBeenCalled();
    expect(mockClearTokens).not.toHaveBeenCalled();
  });

  it('with noAuthRetry, a 401 throws the real ApiError WITHOUT refresh or logout', async () => {
    // Regression guard: a wrong-handoff-code 401 must NOT be treated as an expired
    // session (which would refresh → fail → clearTokens + onLogout the user out).
    mockGetRefreshToken.mockResolvedValue('refresh-token'); // available, must stay unused
    const onLogout = jest.fn();
    setOnLogout(onLogout);
    (fetch as jest.Mock).mockResolvedValue(
      mockResponse({ message: 'Invalid handoff code.' }, 401, false),
    );

    await expect(
      api.post('/deliveries/d-1/confirm-handoff', { code: '000000' }, { noAuthRetry: true }),
    ).rejects.toMatchObject({ status: 401, message: 'Invalid handoff code.' });

    // The bearer token is still attached (not skipAuth), but the 401 is surfaced
    // as a domain error: no refresh attempt, no token clear, no logout.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mockGetRefreshToken).not.toHaveBeenCalled();
    expect(mockClearTokens).not.toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('unwraps data envelope from refresh response when present', async () => {
    mockGetRefreshToken.mockResolvedValue('refresh-token');

    (fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse({}, 401, false))
      .mockResolvedValueOnce(
        mockResponse({ data: { accessToken: 'new-access', refreshToken: 'new-refresh' } }, 200),
      )
      .mockResolvedValueOnce(mockResponse({ data: 'ok' }, 200));

    await api.get('/protected');

    expect(mockSaveTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
  });
});
