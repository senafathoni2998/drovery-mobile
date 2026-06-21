import { pricingApi } from '@/features/delivery/services/pricingApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: { post: jest.fn() },
}));

const mockPost = api.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('pricingApi.estimate', () => {
  it('calls api.post with /pricing/estimate, the payload, and skipAuth', () => {
    mockPost.mockResolvedValue({ baseFee: 2, sizeFee: 6, weightFee: 3, typeFee: 0, total: 11 });

    const data = { packageSize: 'Medium', packageWeight: 1, packageTypes: ['food'] };
    pricingApi.estimate(data);

    expect(mockPost).toHaveBeenCalledWith('/pricing/estimate', data, { skipAuth: true });
  });
});
