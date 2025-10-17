const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Module name mapping for cleaner imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    // Mock CSS and image imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/src/__mocks__/fileMock.js',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/_tests_/**/*.test.[jt]s?(x)',
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
  ],
  
  // Transform configuration for external modules
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react|@sitecore-content-sdk|@sitecore-feaas|framer-motion)/)',
  ],
  
  // Transform settings (using default Next.js transformer)
  // transform: {
  //   '^.+\\.(js|jsx|ts|tsx)$': 'jest-esm-transformer',
  // },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/hooks/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    'src/utils/**/*.{js,jsx,ts,tsx}',
    '!src/components/**/*.stories.{js,jsx,ts,tsx}',
    '!src/components/**/_tests_/**',
    '!src/_tests_/**',
    '!src/**/*.d.ts',
    '!src/**/*.config.{js,ts}',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Coverage reporting
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test timeout for slow tests
  testTimeout: 10000,
  
  // Verbose output for debugging
  verbose: false,
  
  // Watch mode configurations (commented out until packages are installed)
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname',
  // ],
  
  // Global variables available in tests (handled by Next.js Jest)
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.json',
  //   },
  // },
};

module.exports = createJestConfig(customJestConfig);
