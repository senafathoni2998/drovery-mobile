import React from 'react';
import { View } from 'react-native';

const MockMapView = (props: any) =>
  React.createElement(View, { testID: 'mock-map-view', ...props }, props.children);

export const Marker = (props: any) =>
  React.createElement(View, { testID: 'mock-marker', ...props }, props.children);

export const Polyline = (props: any) =>
  React.createElement(View, { testID: 'mock-polyline', ...props });

export default MockMapView;
