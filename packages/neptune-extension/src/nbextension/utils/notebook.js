import { get } from 'lodash';

export function createPlatformNotebook() {

  function getContent() {
    return Promise.resolve(JSON.stringify(IPython.notebook.toJSON()));
  }

  function getMetadata() {
    const notebook = IPython.notebook;
    const {
      notebook_name,
      notebook_path,
    } = notebook;

    const notebookId = get(notebook, 'metadata.neptune.notebookId');

    return {
      path: notebook_path,
      name: notebook_name,
      notebookId,
    }
  }

  function saveNotebookId(notebookId) {
    IPython.notebook.metadata.neptune = {
      notebookId,
    };
    IPython.notebook.save_checkpoint();

    return Promise.resolve();
  }

  return {
    getContent,
    getMetadata,
    saveNotebookId,
  };
}

