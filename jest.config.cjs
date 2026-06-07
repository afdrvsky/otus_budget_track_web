module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
    '^../analytics/gtag$': '<rootDir>/src/__mocks__/gtag.ts',
    '^../../analytics/gtag$': '<rootDir>/src/__mocks__/gtag.ts',
  },
}
