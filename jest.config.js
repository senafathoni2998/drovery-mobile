module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'services/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'features/**/*.{ts,tsx}',
    'config/**/*.{ts,tsx}',
    '!**/*.types.ts',
    '!**/index.ts',
  ],
};
