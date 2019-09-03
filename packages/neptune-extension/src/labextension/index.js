import React from 'react';
import ReactDOM from 'react-dom';
import { DisposableDelegate } from '@phosphor/disposable';
import { Widget } from '@phosphor/widgets'

import App from 'common/components/App';

import { findButtonIdx } from './utils/iterator';

class Extension {

  constructor(app) {
    this.app = app;
    console.log('Running neptune labextension...');
  }

  createNew(panel, context) {
    const widget = new Widget();
    widget.id = 'neptune-app-container';

    panel.toolbar.insertItem(findButtonIdx(panel), 'neptune:configure', widget);

    ReactDOM.render(<App />, widget.node);

    return new DisposableDelegate(() => {
      ReactDOM.unmountComponentAtNode(widget.node);
      widget.dispose();
      resolve();
    });
  }
}

export default {
  id: 'neptune-notebook',
  autoStart: true,
  activate: (app) => {
    app.docRegistry.addWidgetExtension('Notebook', new Extension(app));
  }
}

