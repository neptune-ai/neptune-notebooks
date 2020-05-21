import React from 'react';
import ReactDOM from 'react-dom';
import Jupyter from 'base/js/namespace';
import { logger } from 'common/utils/logger';

import Notebook from './utils/notebook';
import {BootstrapApp} from 'common/components/BootstrapApp';

const log = logger.extend('index.js');

function initializeExtension() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const platformNotebook = new Notebook();

  ReactDOM.render((
    <BootstrapApp platformNotebook={platformNotebook}/>
  ), container);
}

function loadJupyterExtension() {
  log('Running neptune extension...');

  return Jupyter.notebook.config.loaded.then(initializeExtension);
}

/*
 * This is the AMD module's factory return.
 */
export default {
  load_jupyter_extension: loadJupyterExtension,
  load_ipython_extension: loadJupyterExtension,
};

