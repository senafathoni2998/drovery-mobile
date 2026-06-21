import { renderHook, waitFor } from '@testing-library/react-native';
import { useFAQ } from '@/features/profile/hooks/useFAQ';
import { supportApi } from '@/features/profile/services/supportApi';
import type { ApiFaq } from '@/services/api/types';

// ── Mock supportApi ───────────────────────────────────────────────────────────
jest.mock('@/features/profile/services/supportApi');

const mockedSupportApi = supportApi as jest.Mocked<typeof supportApi>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_FAQ: ApiFaq[] = [
  { id: 'faq-1', question: 'How do I track my delivery?', answer: 'Use the tracking page.' },
  { id: 'faq-2', question: 'How do I cancel?', answer: 'Go to order details and tap Cancel.' },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useFAQ', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls supportApi.getFAQ() on mount and sets data', async () => {
    mockedSupportApi.getFAQ.mockResolvedValueOnce(MOCK_FAQ);

    const { result } = renderHook(() => useFAQ());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedSupportApi.getFAQ).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(MOCK_FAQ);
    expect(result.current.error).toBeNull();
  });

  it('data defaults to empty array', () => {
    mockedSupportApi.getFAQ.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useFAQ());

    expect(result.current.data).toEqual([]);
  });

  it('sets fallback error message on non-Error throw', async () => {
    mockedSupportApi.getFAQ.mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useFAQ());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load FAQ');
  });
});
