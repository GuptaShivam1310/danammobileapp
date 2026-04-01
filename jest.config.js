const shouldEnforceCoverage =
  process.env.CI === 'true' || process.env.CI === '1';

module.exports = {
  preset: 'react-native',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@reduxjs/toolkit|redux|immer|react-redux|react-native-config|react-native-vector-icons|react-native-toast-message|react-native-elements|react-native-size-matters)/)',
  ],
  moduleNameMapper: {
    // Mock image imports
    '\\.(png|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/setup/jest.setup.js',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/navigation/**',
    '!src/constants/**',
    '!src/assets/**',
    '!src/theme/**',
  ],
  // coverageThreshold: shouldEnforceCoverage
  //   ? {
  //       global: {
  //         branches: 80,
  //         functions: 80,
  //         lines: 80,
  //         statements: 80,
  //       },
  //     }
  //   : undefined,
};
