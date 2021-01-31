module.exports = {
  testEnvironment: 'node',
  testRegex: '.*spec\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/**/__fixtures/**/*.ts',
    '!<rootDir>/**/__serializers/**/*.ts',
  ],
  testPathIgnorePatterns: ['<rootDir>/dist'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  restoreMocks: true,
};
