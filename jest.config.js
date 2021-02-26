const jestConfig = require('@boilerz/jest-config');

module.exports = {
  ...jestConfig,
  testRegex: '.*spec\\.ts?$',
};
