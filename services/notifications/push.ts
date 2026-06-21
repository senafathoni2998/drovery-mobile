import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '@/features/notifications/services/notificationApi';

let handlerConfigured = false;

/**
 * Configures how notifications are presented while the app is foregrounded.
 * Idempotent — safe to call multiple times.
 */
export function configureNotificationHandler(): void {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Requests notification permission, obtains the Expo push token, and registers
 * it with the backend so it can deliver remote push on delivery status changes.
 *
 * Best-effort: returns null (without throwing) on simulators, in Expo Go, or
 * when permission is denied — the app still works, just without remote push.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    configureNotificationHandler();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Delivery updates',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return null;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse?.data ?? null;

    if (token) {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      try {
        await notificationApi.registerDevice(token, platform);
      } catch {
        // Token obtained but backend registration failed — non-fatal.
      }
    }

    return token;
  } catch {
    // Native module missing (simulator/Expo Go) or permission flow failed.
    return null;
  }
}

/**
 * Immediately presents a local notification (e.g. when the app detects a
 * delivery status change while foregrounded). Best-effort and never throws.
 */
export async function presentLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  try {
    configureNotificationHandler();
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {} },
      trigger: null, // deliver now
    });
  } catch {
    // Ignore — local notifications are a nicety, not a requirement.
  }
}
