import { get } from 'lodash';
import { PlatformNotebookMetadata } from 'types/platform';

export function createPlatformNotebook() {

  function getContent(): Promise<string> {
    return Promise.resolve(JSON.stringify(Jupyter.notebook.toJSON()));
  }

  function getMetadata(): PlatformNotebookMetadata {
    const notebook = Jupyter.notebook;
    const {
      notebook_path,
    } = notebook;

    const notebookId = get(notebook, 'metadata.neptune.notebookId');

    return {
      path: notebook_path,
      notebookId,
    };
  }

  function saveNotebookId(notebookId: string) {
    Jupyter.notebook.metadata.neptune = {
      notebookId,
    };
    Jupyter.notebook.save_checkpoint();

    return Promise.resolve();
  }

  return {
    getContent,
    getMetadata,
    saveNotebookId,
  };
}

