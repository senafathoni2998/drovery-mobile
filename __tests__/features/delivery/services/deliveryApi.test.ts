import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import { api } from '@/services/api/apiClient';

jest.mock('@/services/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

// ==================== create ====================

describe('deliveryApi.create', () => {
  it('calls api.post with /deliveries and the payload', () => {
    const data = { fromAddress: 'A', toAddress: 'B', receiver: 'Bob', packages: 'Box',
      packageSize: 'Small', packageWeight: 1, packageTypes: [], pickupDate: '2024-01-01', pickupTime: '10:00 AM' };
    mockPost.mockResolvedValue(data);

    deliveryApi.create(data);

    expect(mockPost).toHaveBeenCalledWith('/deliveries', data);
  });
});

// ==================== list + buildQuery ====================

describe('deliveryApi.list', () => {
  it('calls api.get with /deliveries when no params provided', () => {
    mockGet.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    deliveryApi.list();

    expect(mockGet).toHaveBeenCalledWith('/deliveries');
  });

  it('builds query string with a single param', () => {
    mockGet.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    deliveryApi.list({ status: 'current' });

    expect(mockGet).toHaveBeenCalledWith('/deliveries?status=current');
  });

  it('builds query string with multiple params', () => {
    mockGet.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    deliveryApi.list({ status: 'current', page: 1, limit: 10 });

    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain('status=current');
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
    expect(url.startsWith('/deliveries?')).toBe(true);
  });

  it('filters out undefined values from query string', () => {
    mockGet.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    deliveryApi.list({ status: 'current', q: undefined });

    expect(mockGet).toHaveBeenCalledWith('/deliveries?status=current');
  });

  it('filters out empty string values from query string', () => {
    mockGet.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    deliveryApi.list({ status: 'current', q: '' });

    expect(mockGet).toHaveBeenCalledWith('/deliveries?status=current');
  });

  it('URI-encodes param values with special characters', () => {
    mockGet.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    deliveryApi.list({ q: 'hello world' });

    expect(mockGet).toHaveBeenCalledWith('/deliveries?q=hello%20world');
  });
});

// ==================== getActive ====================

describe('deliveryApi.getActive', () => {
  it('calls api.get with /deliveries/active', () => {
    mockGet.mockResolvedValue([]);

    deliveryApi.getActive();

    expect(mockGet).toHaveBeenCalledWith('/deliveries/active');
  });
});

// ==================== getRecent ====================

describe('deliveryApi.getRecent', () => {
  it('calls api.get with /deliveries/recent', () => {
    mockGet.mockResolvedValue([]);

    deliveryApi.getRecent();

    expect(mockGet).toHaveBeenCalledWith('/deliveries/recent');
  });
});

// ==================== getById ====================

describe('deliveryApi.getById', () => {
  it('calls api.get with /deliveries/:id', () => {
    mockGet.mockResolvedValue({});

    deliveryApi.getById('uuid-123');

    expect(mockGet).toHaveBeenCalledWith('/deliveries/uuid-123');
  });
});

// ==================== track ====================

describe('deliveryApi.track', () => {
  it('calls api.get with /deliveries/track?trackingId=value', () => {
    mockGet.mockResolvedValue({});

    deliveryApi.track('TRK-001');

    expect(mockGet).toHaveBeenCalledWith('/deliveries/track?trackingId=TRK-001');
  });

  it('URI-encodes special characters in trackingId', () => {
    mockGet.mockResolvedValue({});

    deliveryApi.track('TRK 001');

    expect(mockGet).toHaveBeenCalledWith('/deliveries/track?trackingId=TRK%20001');
  });
});

// ==================== cancel ====================

describe('deliveryApi.cancel', () => {
  it('calls api.post with /deliveries/:id/cancel', () => {
    mockPost.mockResolvedValue({});

    deliveryApi.cancel('uuid-123');

    expect(mockPost).toHaveBeenCalledWith('/deliveries/uuid-123/cancel');
  });
});
