/*
 * The modules below will defined as dependencies.
 */
import $ from 'jquery'
import Jupyter from 'base/js/namespace'
import events from 'base/js/events'
import dialog from 'base/js/dialog'

/*
 * The modules below will be bundled.
 */
import React from 'react';
import ReactDOM from 'react-dom';

/*
 * The React code could look like this:
 *
 * const container = document.createElement('div')
 * document.body.appendChild(container)
 *
 * const exit = () => {
 *   ReactDOM.unmountComponentAtNode(container)
 *   document.body.removeChild(container)
 * }
 *
 * React.DOM.render(<App onExit={exit} />, container)
 */

/* Here starts the code.... */

function loadJupyterExtension() {
  console.log('Running neptune extension...');
}

/* Here ends the code. */

/*
 * This is the AMD module's factory return.
 */
export default {
  load_jupyter_extension: loadJupyterExtension,
  load_ipython_extension: loadJupyterExtension
}

