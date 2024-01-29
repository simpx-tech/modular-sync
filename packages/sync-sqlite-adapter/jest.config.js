module.exports = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};