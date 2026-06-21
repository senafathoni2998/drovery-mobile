import * as SecureStore from 'expo-secure-store';

/**
 * On-device cache for a delivery's recipient handoff code. The backend returns
 * the 6-digit code from POST /deliveries EXACTLY ONCE and never again, so the
 * customer (who is often the recipient) needs a way to re-read their own code at
 * drop-off. We keep it in the OS keychain/keystore (encrypted at rest, same as
 * the auth tokens) for the delivery's active lifetime, then clear it once the
 * delivery settles.
 *
 * Security trade-off (accepted): a plaintext OTP lives in the device's encrypted
 * keychain while the delivery is in flight. It's device-local (not a network
 * surface), never logged, and never synced to the cloud. Possession of the code
 * WITHOUT the owner's account still can't finalize the delivery — the backend
 * enforces a 5-attempt cap and owner-JWT scoping on /confirm-handoff.
 */
const key = (deliveryId: string) => `drovery_handoff_${deliveryId}`;

export function saveHandoffCode(deliveryId: string, code: string): Promise<void> {
  return SecureStore.setItemAsync(key(deliveryId), code);
}

export function getHandoffCode(deliveryId: string): Promise<string | null> {
  return SecureStore.getItemAsync(key(deliveryId));
}

export function clearHandoffCode(deliveryId: string): Promise<void> {
  return SecureStore.deleteItemAsync(key(deliveryId));
}
