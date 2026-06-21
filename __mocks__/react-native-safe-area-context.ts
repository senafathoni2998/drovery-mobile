import React from 'react';
import { View } from 'react-native';

export const useSafeAreaInsets = jest.fn(() => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}));

export const SafeAreaProvider = (props: any) =>
  React.createElement(View, props, props.children);
