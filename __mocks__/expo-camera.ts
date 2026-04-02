import React from 'react';
import { View } from 'react-native';

export const CameraView = (props: any) =>
  React.createElement(View, { testID: 'mock-camera', ...props }, props.children);

export const useCameraPermissions = jest.fn(() => [
  { granted: true },
  jest.fn(),
]);
