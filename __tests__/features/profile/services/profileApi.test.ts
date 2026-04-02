import { profileApi } from '@/features/profile/services/profileApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockGet = api.get as jest.Mock;
const mockPatch = api.patch as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('profileApi.getMe', () => {
  it('calls api.get with /users/me', () => {
    mockGet.mockResolvedValue({});
    profileApi.getMe();
    expect(mockGet).toHaveBeenCalledWith('/users/me');
  });
});

describe('profileApi.updateMe', () => {
  it('calls api.patch with /users/me and the partial update data', () => {
    mockPatch.mockResolvedValue({});
    profileApi.updateMe({ name: 'Ahmad', phone: '+60123456789' });
    expect(mockPatch).toHaveBeenCalledWith('/users/me', { name: 'Ahmad', phone: '+60123456789' });
  });
});

describe('profileApi.getStats', () => {
  it('calls api.get with /users/me/stats', () => {
    mockGet.mockResolvedValue({ total: 0, active: 0, completed: 0 });
    profileApi.getStats();
    expect(mockGet).toHaveBeenCalledWith('/users/me/stats');
  });
});
