import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  configureNotificationHandler,
  registerForPushNotifications,
} from '@/services/notifications/push';

/**
 * Headless component: once the user is authenticated, registers this device's
 * Expo push token with the backend so it can receive remote delivery-status
 * notifications. Renders nothing.
 */
export function PushRegistrar() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void registerForPushNotifications();
    }
  }, [isAuthenticated]);

  return null;
}
