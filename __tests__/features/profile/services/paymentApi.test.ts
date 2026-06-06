import { paymentApi } from '@/features/profile/services/paymentApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockDelete = api.delete as jest.Mock;
const mockPatch = api.patch as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('paymentApi.list', () => {
  it('calls api.get with /payment-methods', () => {
    mockGet.mockResolvedValue([]);
    paymentApi.list();
    expect(mockGet).toHaveBeenCalledWith('/payment-methods');
  });
});

describe('paymentApi.add', () => {
  it('calls api.post with /payment-methods and the card data', () => {
    mockPost.mockResolvedValue({});
    const data = { network: 'Visa', last4: '4242', holderName: 'Ahmad', expiry: '12/26' };
    paymentApi.add(data);
    expect(mockPost).toHaveBeenCalledWith('/payment-methods', data);
  });
});

describe('paymentApi.remove', () => {
  it('calls api.delete with /payment-methods/:id', () => {
    mockDelete.mockResolvedValue({ success: true });
    paymentApi.remove('pm-123');
    expect(mockDelete).toHaveBeenCalledWith('/payment-methods/pm-123');
  });
});

describe('paymentApi.setDefault', () => {
  it('calls api.patch with /payment-methods/:id/default', () => {
    mockPatch.mockResolvedValue({});
    paymentApi.setDefault('pm-123');
    expect(mockPatch).toHaveBeenCalledWith('/payment-methods/pm-123/default');
  });
});

describe('paymentApi.setupIntent', () => {
  it('calls api.post with /payment-methods/setup-intent', () => {
    mockPost.mockResolvedValue({ mock: true });
    paymentApi.setupIntent();
    expect(mockPost).toHaveBeenCalledWith('/payment-methods/setup-intent');
  });
});

describe('paymentApi.sync', () => {
  it('calls api.post with /payment-methods/sync', () => {
    mockPost.mockResolvedValue([]);
    paymentApi.sync();
    expect(mockPost).toHaveBeenCalledWith('/payment-methods/sync');
  });
});
