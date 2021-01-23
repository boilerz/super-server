module.exports = {
  testEnvironment: 'node',
  testRegex: '.*spec\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  testPathIgnorePatterns: ['<rootDir>/dist'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  restoreMocks: true,
};
