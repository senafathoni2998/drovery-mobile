import { verificationApi } from '@/features/auth/services/verificationApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: { post: jest.fn() },
}));

const mockPost = api.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('verificationApi.verifyEmail', () => {
  it('posts the token to /auth/verify-email without auth', () => {
    mockPost.mockResolvedValue({ success: true });
    verificationApi.verifyEmail('tok');
    expect(mockPost).toHaveBeenCalledWith(
      '/auth/verify-email',
      { token: 'tok' },
      { skipAuth: true },
    );
  });
});

describe('verificationApi.resendVerification', () => {
  it('posts to /auth/resend-verification (authed)', () => {
    mockPost.mockResolvedValue({ success: true });
    verificationApi.resendVerification();
    expect(mockPost).toHaveBeenCalledWith('/auth/resend-verification');
  });
});
