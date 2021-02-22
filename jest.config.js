module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  restoreMocks: true,
};
