import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import Jupyter from 'base/js/namespace';

import App from 'common/components/App';

import Notebook from './utils/notebook';
import configureStore from 'common/state/store';

function initializeExtension() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const platformNotebook = new Notebook();

  const store = configureStore();

  ReactDOM.render((
    <Provider store={store}>
      <App platformNotebook={platformNotebook} />
    </Provider>
  ), container);
}

function loadJupyterExtension() {
  console.log('Running neptune extension...'); // eslint-disable-line no-console

  return Jupyter.notebook.config.loaded.then(initializeExtension);
}

/*
 * This is the AMD module's factory return.
 */
export default {
  load_jupyter_extension: loadJupyterExtension,
  load_ipython_extension: loadJupyterExtension,
};

