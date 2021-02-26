const jestConfig = require('@boilerz/jest-config');

module.exports = {
  ...jestConfig,
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
};
