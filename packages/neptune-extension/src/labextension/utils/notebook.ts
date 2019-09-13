import { JupyterLab } from '@jupyterlab/application';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';

import { get } from 'lodash';
import { PlatformNotebook } from "types/platform";

interface NeptuneContextMetadata {
  notebookId?: string
}

class Notebook implements PlatformNotebook {
  context: DocumentRegistry.IContext<INotebookModel>;
  app: JupyterLab;

  constructor(
    context: DocumentRegistry.IContext<INotebookModel>,
    app: JupyterLab,
  ) {
    this.context = context;
    this.app = app;
  };

  async getContent() {
    const file = await this.app.serviceManager.contents.get(this.context.path, { content: true });

    return file.content;
  };

  getMetadata() {
    const neptuneMetadata = this.context.model.metadata.get('neptune');
    const notebookId = get(neptuneMetadata, 'notebookId');

    return {
      path: this.context.path,
      notebookId,
    };
  };

  async saveNotebookId(notebookId: string) {
    const metadata = this.context.model.metadata;

    const neptuneMetadata = metadata.has('neptune')
      ? metadata.get('neptune') as NeptuneContextMetadata
      : {};

    metadata.set('neptune', { ...neptuneMetadata, notebookId });

    return this.context.save();
  };
}

export default Notebook
