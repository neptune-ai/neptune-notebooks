
import { get } from 'lodash';

export function createPlatformNotebook(context, app) {

  function getContent() {
    return new Promise(resolve => {
      app.serviceManager.contents
        .get(context.path, { content: true })
        .then(file => {
          resolve(JSON.stringify(file.content));
        });
    });
  }

  function getMetadata() {
    const neptuneMetadata = context.model.metadata.get('neptune');
    const notebookId = get(neptuneMetadata, 'notebookId');

    return {
      path: context.path,
      name: null,
      notebookId,
    }
  }

  function saveNotebookId(notebookId) {
    const metadata = context.model.metadata;

    const neptuneMetadata = metadata.has('neptune')
      ? metadata.get('neptune')
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

