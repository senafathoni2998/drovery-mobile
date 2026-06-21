import { proofApi } from '@/features/delivery/services/proofApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: { post: jest.fn(), get: jest.fn() },
}));

const mockPost = api.post as jest.Mock;
const mockGet = api.get as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('proofApi.submit', () => {
  it('posts the proof body to /deliveries/:id/proof', () => {
    mockPost.mockResolvedValue({});
    proofApi.submit('d-1', { photoBase64: 'abc', lat: -6.9, lng: 107.6 });
    expect(mockPost).toHaveBeenCalledWith('/deliveries/d-1/proof', {
      photoBase64: 'abc',
      lat: -6.9,
      lng: 107.6,
    });
  });
});

describe('proofApi.get', () => {
  it('gets /deliveries/:id/proof', () => {
    mockGet.mockResolvedValue({});
    proofApi.get('d-1');
    expect(mockGet).toHaveBeenCalledWith('/deliveries/d-1/proof');
  });
});
