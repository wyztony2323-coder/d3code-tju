import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

export function rootContainer(container: React.ReactElement) {
  return React.createElement(Provider, { store }, container);
}
