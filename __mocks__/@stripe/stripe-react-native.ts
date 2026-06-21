import React from 'react';
import { View } from 'react-native';

export const StripeProvider = (props: any) =>
  React.createElement(View, props, props.children);

export const useStripe = () => ({
  initPaymentSheet: jest.fn(async () => ({})),
  presentPaymentSheet: jest.fn(async () => ({})),
});

export const CardField = (props: any) => React.createElement(View, props);
