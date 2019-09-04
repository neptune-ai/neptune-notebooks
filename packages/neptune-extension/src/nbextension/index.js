import React from 'react';
import ReactDOM from 'react-dom';
import Jupyter from 'base/js/namespace'

import App from 'common/components/App';

import { createPlatformNotebook } from './utils/notebook';

function initializeExtension() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const platformNotebook = createPlatformNotebook();

  ReactDOM.render(<App platformNotebook={platformNotebook} />, container);
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
  load_ipython_extension: loadJupyterExtension
}

