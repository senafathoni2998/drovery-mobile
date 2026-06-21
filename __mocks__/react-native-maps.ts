import React from 'react';
import { View } from 'react-native';

const MockMapView = (props: any) =>
  React.createElement(View, { testID: 'mock-map-view', ...props }, props.children);

export const Marker = (props: any) =>
  React.createElement(View, { testID: 'mock-marker', ...props }, props.children);

export const Polyline = (props: any) =>
  React.createElement(View, { testID: 'mock-polyline', ...props });

export const MarkerAnimated = (props: any) =>
  React.createElement(View, { testID: 'mock-marker-animated', ...props }, props.children);

export const PROVIDER_DEFAULT = 'default';
export const PROVIDER_GOOGLE = 'google';

export class AnimatedRegion {
  constructor(public value: any) {}
  timing() {
    return { start: jest.fn() };
  }
}

export default MockMapView;
