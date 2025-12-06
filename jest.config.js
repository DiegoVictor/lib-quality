const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/controllers/*.ts',
    'src/middlewares/*.ts',
    'src/parses/*.ts',
    'src/repositories/*.ts',
    'src/services/*.ts',
    'src/validators/*.ts',
  ],
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['text', 'lcov'],
  globalSetup: './tests/setup.ts',
  globalTeardown: './tests/teardown.ts',
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
};
