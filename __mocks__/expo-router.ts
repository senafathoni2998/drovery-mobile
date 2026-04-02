export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  dismissAll: jest.fn(),
}));

export const useLocalSearchParams = jest.fn(() => ({}));

export const useFocusEffect = jest.fn((cb: () => void) => {
  // no-op in tests
});
