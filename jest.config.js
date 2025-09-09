module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: { '^react-native$': '<rootDir>/__mocks__/react-native.js' },
transformIgnorePatterns: ['node_modules/(?!(react-native|@react-navigation|@apollo/client|react-native-pager-view)/)'],
};