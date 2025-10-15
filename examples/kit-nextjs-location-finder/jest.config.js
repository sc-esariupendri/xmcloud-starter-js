const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  testMatch: ['<rootDir>/src/_tests_/**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react|@sitecore-content-sdk|@sitecore-feaas)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'jest-esm-transformer',
  },
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx,ts,tsx}',
    '!src/components/**/*.stories.{js,jsx,ts,tsx}',
    '!src/components/**/_tests_/**',
    '!src/**/*.d.ts',
  ],
};

module.exports = createJestConfig(customJestConfig);
