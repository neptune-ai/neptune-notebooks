import React from 'react';
import {Provider} from 'react-redux';

import configureStore from 'common/state/store';
import App, {AppProps} from './App';

export const BootstrapApp: React.FC<AppProps> = ({
  platformNotebook
}) => {
  const storeRef = React.useRef<ReturnType<typeof configureStore>>();
  if (!storeRef.current) {
    /*
     * In JupyterLab every notebook is a separate application.
     */
    storeRef.current = configureStore();
  }

  return (
    <Provider store={storeRef.current}>
      <App platformNotebook={platformNotebook} />
    </Provider>
  );
};
