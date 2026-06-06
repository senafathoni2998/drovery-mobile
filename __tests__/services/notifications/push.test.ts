import * as Notifications from 'expo-notifications';
import {
  presentLocalNotification,
  registerForPushNotifications,
} from '@/services/notifications/push';
import { notificationApi } from '@/features/notifications/services/notificationApi';

jest.mock('@/features/notifications/services/notificationApi', () => ({
  notificationApi: { registerDevice: jest.fn().mockResolvedValue({ id: 'd1' }) },
}));

const mockedNotif = Notifications as jest.Mocked<typeof Notifications>;

describe('push notifications service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockedNotif.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (mockedNotif.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
      data: 'ExponentPushToken[test-token]',
    });
  });

  describe('registerForPushNotifications', () => {
    it('registers the device token with the backend when permission is granted', async () => {
      const token = await registerForPushNotifications();

      expect(token).toBe('ExponentPushToken[test-token]');
      expect(notificationApi.registerDevice).toHaveBeenCalledWith(
        'ExponentPushToken[test-token]',
        expect.stringMatching(/^(ios|android)$/),
      );
    });

    it('returns null and does not register when permission is denied', async () => {
      (mockedNotif.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (mockedNotif.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const token = await registerForPushNotifications();

      expect(token).toBeNull();
      expect(notificationApi.registerDevice).not.toHaveBeenCalled();
    });

    it('degrades gracefully (returns null) if the native call throws', async () => {
      (mockedNotif.getPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('no native module'),
      );

      await expect(registerForPushNotifications()).resolves.toBeNull();
    });
  });

  describe('presentLocalNotification', () => {
    it('schedules an immediate local notification', async () => {
      await presentLocalNotification('Pickup In Progress', 'On the way', {
        deliveryId: 'd-1',
      });

      expect(mockedNotif.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Pickup In Progress',
          body: 'On the way',
          data: { deliveryId: 'd-1' },
        },
        trigger: null,
      });
    });
  });
});
