import React from 'react';
import {Provider} from 'react-redux';

import configureStore from 'common/state/store';
import App, {AppProps} from './App';

const store = configureStore();

export const BootstrapApp: React.FC<AppProps> = ({
  platformNotebook
}) => (
  <Provider store={store}>
    <App platformNotebook={platformNotebook} />
  </Provider>
);
