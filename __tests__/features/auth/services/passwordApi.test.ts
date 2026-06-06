import { passwordApi } from '@/features/auth/services/passwordApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: { post: jest.fn() },
}));

const mockPost = api.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('passwordApi.forgotPassword', () => {
  it('posts the email to /auth/forgot-password without auth', () => {
    mockPost.mockResolvedValue({ success: true });
    passwordApi.forgotPassword('user@example.com');
    expect(mockPost).toHaveBeenCalledWith(
      '/auth/forgot-password',
      { email: 'user@example.com' },
      { skipAuth: true },
    );
  });
});

describe('passwordApi.resetPassword', () => {
  it('posts token + newPassword to /auth/reset-password without auth', () => {
    mockPost.mockResolvedValue({ success: true });
    passwordApi.resetPassword('reset-tok', 'newpass123');
    expect(mockPost).toHaveBeenCalledWith(
      '/auth/reset-password',
      { token: 'reset-tok', newPassword: 'newpass123' },
      { skipAuth: true },
    );
  });
});
