import { JupyterLab } from '@jupyterlab/application';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';

import { get } from 'lodash';
import { PlatformNotebookMetadata } from 'types/platform';

interface NeptuneContextMetadata {
  notebookId?: string
}

export function createPlatformNotebook(
  context: DocumentRegistry.IContext<INotebookModel>,
  app: JupyterLab,
) {

  async function getContent(): Promise<string> {
    const file = await app.serviceManager.contents.get(context.path, { content: true });

    return JSON.stringify(file.content);
  }

  function getMetadata(): PlatformNotebookMetadata {
    const neptuneMetadata = context.model.metadata.get('neptune');
    const notebookId = get(neptuneMetadata, 'notebookId');

    return {
      path: context.path,
      notebookId,
    };
  }

  function saveNotebookId(notebookId: string) {
    const metadata = context.model.metadata;

    const neptuneMetadata = metadata.has('neptune')
      ? metadata.get('neptune') as NeptuneContextMetadata
      : {};

    metadata.set('neptune', { ...neptuneMetadata, notebookId });

    return context.save();
  }

  return {
    getContent,
    getMetadata,
    saveNotebookId,
  };
}
