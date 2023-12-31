/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 1900_000,
  maxWorkers: 1,
  reporters: ['default', 'jest-github-actions-reporter'],
  testLocationInResults: true,
};
