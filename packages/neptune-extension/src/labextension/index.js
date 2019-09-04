import React from 'react';
import ReactDOM from 'react-dom';
import { DisposableDelegate } from '@phosphor/disposable';
import { Widget } from '@phosphor/widgets';

import App from 'common/components/App';

import { findButtonIdx } from './utils/iterator';
import { createPlatformNotebook } from './utils/notebook';

class Extension {

  constructor(app) {
    this.app = app;
    // eslint-disable-next-line no-console
    console.log('Running neptune labextension...');
  }

  createNew(panel) {
    const widget = new Widget();
    widget.id = 'neptune-app-container';

    panel.toolbar.insertItem(findButtonIdx(panel), 'neptune:configure', widget);

    context.ready.then(() => {
      const platformNotebook = createPlatformNotebook(context, this.app);

      ReactDOM.render(<App platformNotebook={platformNotebook} />, widget.node);
    });

    return new DisposableDelegate(() => {
      ReactDOM.unmountComponentAtNode(widget.node);
      widget.dispose();
    });
  }
}

export default {
  id: 'neptune-notebook',
  autoStart: true,
  activate: (app) => {
    app.docRegistry.addWidgetExtension('Notebook', new Extension(app));
  },
};

