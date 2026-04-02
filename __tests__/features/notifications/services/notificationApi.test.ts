import { notificationApi } from '@/features/notifications/services/notificationApi';
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

describe('notificationApi.getAll', () => {
  it('calls api.get with /notifications', () => {
    mockGet.mockResolvedValue([]);
    notificationApi.getAll();
    expect(mockGet).toHaveBeenCalledWith('/notifications');
  });
});

describe('notificationApi.getUnreadCount', () => {
  it('calls api.get with /notifications/unread-count', () => {
    mockGet.mockResolvedValue({ count: 3 });
    notificationApi.getUnreadCount();
    expect(mockGet).toHaveBeenCalledWith('/notifications/unread-count');
  });
});

describe('notificationApi.markAsRead', () => {
  it('calls api.patch with /notifications/:id/read', () => {
    mockPatch.mockResolvedValue({});
    notificationApi.markAsRead('notif-1');
    expect(mockPatch).toHaveBeenCalledWith('/notifications/notif-1/read');
  });
});

describe('notificationApi.markAllAsRead', () => {
  it('calls api.patch with /notifications/read-all', () => {
    mockPatch.mockResolvedValue({ count: 5 });
    notificationApi.markAllAsRead();
    expect(mockPatch).toHaveBeenCalledWith('/notifications/read-all');
  });
});
