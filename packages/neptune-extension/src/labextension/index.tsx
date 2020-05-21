import React from 'react';
import ReactDOM from 'react-dom';
import { DisposableDelegate } from '@lumino/disposable';
import { Widget } from '@lumino/widgets';
import { JupyterLab } from '@jupyterlab/application';
import {
  INotebookModel,
  NotebookPanel,
} from '@jupyterlab/notebook';
import { DocumentRegistry } from '@jupyterlab/docregistry';


import { findButtonIdx } from './utils/iterator';
import Notebook from './utils/notebook';
import {BootstrapApp} from "../common/components/BootstrapApp";
import { logger } from 'common/utils/logger';

const log = logger.extend('index.js');

class Extension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private readonly app: JupyterLab;

  constructor(app: JupyterLab) {
    this.app = app;
  }

  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>) {
    const widget = new Widget();
    widget.id = 'neptune-app-container';

    panel.toolbar.insertItem(findButtonIdx(panel), 'neptune:configure', widget);

    context.ready.then(() => {
      const platformNotebook = new Notebook(context, this.app);

      ReactDOM.render((
        <BootstrapApp platformNotebook={platformNotebook}/>
      ), widget.node);
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
  activate: (app: JupyterLab) => {
    log('Activating JupyterLab extension');
    app.docRegistry.addWidgetExtension('Notebook', new Extension(app));
  },
};

