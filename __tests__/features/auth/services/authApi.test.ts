import { authApi } from '@/features/auth/services/authApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: {
    post: jest.fn(),
  },
}));

const mockPost = api.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('authApi.login', () => {
  it('calls api.post with /auth/login, credentials, and skipAuth', () => {
    mockPost.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', user: {} });

    authApi.login('user@test.com', 'pass123');

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'user@test.com', password: 'pass123' },
      { skipAuth: true },
    );
  });
});

describe('authApi.signup', () => {
  it('calls api.post with /auth/signup, name+email+password, and skipAuth', () => {
    mockPost.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', user: {} });

    authApi.signup('Ahmad', 'user@test.com', 'pass123');

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/signup',
      { name: 'Ahmad', email: 'user@test.com', password: 'pass123' },
      { skipAuth: true },
    );
  });
});

describe('authApi.refresh', () => {
  it('calls api.post with /auth/refresh, refreshToken, and skipAuth', () => {
    mockPost.mockResolvedValue({ accessToken: 'new-a', refreshToken: 'new-r' });

    authApi.refresh('my-refresh-token');

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/refresh',
      { refreshToken: 'my-refresh-token' },
      { skipAuth: true },
    );
  });
});
