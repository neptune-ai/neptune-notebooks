import { get } from 'lodash';
import {
  PlatformNotebook,
  NeptuneClientMsg,
} from 'types/platform';

import Jupyter from 'base/js/namespace';

import { openNotebookInNewWindow } from './window';

class Notebook implements PlatformNotebook {
  
  async saveWorkingCopyAndGetContent() {
    Jupyter.notebook.save_checkpoint();

    // The function below returns the (unsaved) working copy.
    return Jupyter.notebook.toJSON();
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

  executeKernelCode(code: string) {
    Jupyter.notebook.kernel.execute(code);
  }

  async registerNeptuneMessageListener(callback: (msg: NeptuneClientMsg) => void) {
    Jupyter.notebook.kernel.comm_manager.register_target(
      'neptune_comm',
      (comm: NbComm) => {
        comm.on_msg((msg: NbCommMsgMsg) => {
          callback(msg.content.data as NeptuneClientMsg);
        });
      }
    );
  }

  openNotebookInNewWindow(content: any) {
    openNotebookInNewWindow(content);
  }
}

export default Notebook;

