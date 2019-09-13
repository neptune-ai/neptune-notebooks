import React from 'react';
import ReactDOM from 'react-dom';
import { DisposableDelegate } from '@phosphor/disposable';
import { Widget } from '@phosphor/widgets';
import { JupyterLab } from "@jupyterlab/application";
import {
  INotebookModel,
  NotebookPanel,
} from "@jupyterlab/notebook";
import { DocumentRegistry } from "@jupyterlab/docregistry";

import App from 'common/components/App';

import { findButtonIdx } from './utils/iterator';
import Notebook from './utils/notebook';

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
  activate: (app: JupyterLab) => {
    app.docRegistry.addWidgetExtension('Notebook', new Extension(app));
  },
};

