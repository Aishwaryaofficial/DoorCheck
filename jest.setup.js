/**
 * @format
 */
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-community/geolocation', () => ({
  setRNConfiguration: jest.fn(),
  getCurrentPosition: jest.fn(),
}));

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const {View} = require('react-native');
  return ({children, ...props}: {children?: React.ReactNode}) =>
    React.createElement(View, props, children);
});
