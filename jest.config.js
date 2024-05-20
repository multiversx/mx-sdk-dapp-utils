module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/tests/*.{test.ts,test.tsx,spec.tsx,spec.ts}'],
  coveragePathIgnorePatterns: [],
  testEnvironment: 'jsdom',
  modulePaths: ['<rootDir>/src'],
  transform: {
    '^.+\\.(ts|js|tsx|jsx)$': ['@swc/jest']
  },
  transformIgnorePatterns: ['node_modules/(^.+\\\\.(ts|js)$)'],
  testMatch: ['**/src/**/?(*.)+(spec|test|bgTest).ts?(x)'],
  moduleNameMapper: {
    '\\.(css|sass|scss)$': 'identity-obj-proxy'
  },
  moduleFileExtensions: [
    // Place tsx and ts to beginning as suggestion from Jest team
    // https://jestjs.io/docs/configuration#modulefileextensions-arraystring
    'tsx',
    'ts',
    'web.js',
    'js',
    'web.ts',
    'web.tsx',
    'json',
    'node'
  ],
  moduleDirectories: ['node_modules', 'src'],
  bail: 1,
  workerIdleMemoryLimit: '15%', // Memory used per worker. Required to prevent memory leaks
  maxWorkers: '50%', // Maximum tests ran in parallel. Required to prevent CPU usage at 100%
  resetMocks: false
};
