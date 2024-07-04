/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: ['__tests__/.*.e2e.test.ts$', '.*\\.unit\\.test\\.ts$', '.*\\.integration\\.test\\.ts$'],
  setupFilesAfterEnv: ["./__tests__/jest.setup.ts"]
};

