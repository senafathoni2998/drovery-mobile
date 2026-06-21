import { supportApi } from '@/features/profile/services/supportApi';
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

describe('supportApi.getFAQ', () => {
  it('calls api.get with /support/faq and skipAuth', () => {
    mockGet.mockResolvedValue([]);
    supportApi.getFAQ();
    expect(mockGet).toHaveBeenCalledWith('/support/faq', { skipAuth: true });
  });
});

describe('supportApi.createTicket', () => {
  it('calls api.post with /support/tickets and the message', () => {
    mockPost.mockResolvedValue({ success: true, ticketId: 'tkt-1' });
    supportApi.createTicket('My drone is late');
    expect(mockPost).toHaveBeenCalledWith('/support/tickets', { message: 'My drone is late' });
  });
});
