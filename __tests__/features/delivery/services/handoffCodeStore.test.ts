import * as SecureStore from 'expo-secure-store';
import {
  saveHandoffCode,
  getHandoffCode,
  clearHandoffCode,
} from '@/features/delivery/services/handoffCodeStore';

const mockSetItem = SecureStore.setItemAsync as jest.Mock;
const mockGetItem = SecureStore.getItemAsync as jest.Mock;
const mockDeleteItem = SecureStore.deleteItemAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('handoffCodeStore', () => {
  it('saves the code under a per-delivery key', async () => {
    mockSetItem.mockResolvedValue(undefined);
    await saveHandoffCode('d-1', '123456');
    expect(mockSetItem).toHaveBeenCalledWith('drovery_handoff_d-1', '123456');
  });

  it('reads the stored code', async () => {
    mockGetItem.mockResolvedValue('123456');
    await expect(getHandoffCode('d-1')).resolves.toBe('123456');
    expect(mockGetItem).toHaveBeenCalledWith('drovery_handoff_d-1');
  });

  it('returns null when no code is stored', async () => {
    mockGetItem.mockResolvedValue(null);
    await expect(getHandoffCode('d-x')).resolves.toBeNull();
  });

  it('clears the code (spent / settled)', async () => {
    mockDeleteItem.mockResolvedValue(undefined);
    await clearHandoffCode('d-1');
    expect(mockDeleteItem).toHaveBeenCalledWith('drovery_handoff_d-1');
  });
});
