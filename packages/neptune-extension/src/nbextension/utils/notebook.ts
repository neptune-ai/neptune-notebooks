import { get } from 'lodash';
import {
  PlatformNotebook,
} from 'types/platform';


class Notebook implements PlatformNotebook {
  getContent() {
    return Promise.resolve(JSON.stringify(Jupyter.notebook.toJSON()));
  }

  getMetadata() {
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

  async saveNotebookId(notebookId: string) {
    Jupyter.notebook.metadata.neptune = {
      notebookId,
    };
    Jupyter.notebook.save_checkpoint();
  }
}

export default Notebook;

