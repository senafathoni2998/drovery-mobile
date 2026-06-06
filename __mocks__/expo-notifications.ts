// Manual jest mock for expo-notifications (native module unavailable in tests).
export const AndroidImportance = { DEFAULT: 3, HIGH: 4, MAX: 5 };

export const setNotificationHandler = jest.fn();
export const setNotificationChannelAsync = jest.fn(async () => undefined);
export const getPermissionsAsync = jest.fn(async () => ({ status: 'granted' }));
export const requestPermissionsAsync = jest.fn(async () => ({ status: 'granted' }));
export const getExpoPushTokenAsync = jest.fn(async () => ({
  data: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
}));
export const scheduleNotificationAsync = jest.fn(async () => 'local-notification-id');
export const addNotificationReceivedListener = jest.fn(() => ({ remove: jest.fn() }));
export const addNotificationResponseReceivedListener = jest.fn(() => ({ remove: jest.fn() }));
