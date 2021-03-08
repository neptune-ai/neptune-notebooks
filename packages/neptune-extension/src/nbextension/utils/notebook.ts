import { get } from 'lodash';
import {
  EditablePlatformNotebookMetadata,
  NeptuneClientMsg,
  PlatformNotebook,
} from 'types/platform';

import Jupyter from 'base/js/namespace';
import CommManager from 'services/kernels/comm';
import JupyterConfig from 'services/config';
import JupyterContents from 'contents';
import { logger } from 'common/utils/logger';

const log = logger.extend('platform-notebook');

class Notebook implements PlatformNotebook {

  baseUrl: string;
  contentManager: NbContentsManager;

  constructor() {
    this.baseUrl = Jupyter.utils.get_body_data("baseUrl");

    const commonOptions = {
      base_url: this.baseUrl,
      notebook_path: Jupyter.utils.get_body_data("notebookPath"),
    };

    const commonConfig = new JupyterConfig.ConfigSection('common', commonOptions);

    this.contentManager = new JupyterContents.Contents({
      base_url: commonOptions.base_url,
      common_config: commonConfig,
    });

    log('Platform notebook created');
  };

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

    const notebookId: string | undefined = get(notebook, 'metadata.neptune.notebookId');
    const projectVersion: number | undefined = get(notebook, 'metadata.neptune.projectVersion');

    return {
      path: notebook_path,
      notebookId,
      projectVersion,
    };
  }

  async setMetadata(metadata: EditablePlatformNotebookMetadata) {
    Jupyter.notebook.metadata.neptune = {
      notebookId: metadata.notebookId,
      projectVersion: metadata.projectVersion,
    };
    Jupyter.notebook.save_checkpoint();
  }

  executeKernelCode(code: string) {
    Jupyter.notebook.kernel.execute(code);
  }

  async registerNeptuneMessageListener(callback: (msg: NeptuneClientMsg) => void) {
    /**
     * Usage of "CommManager" here is a workaround.
     * We have to "use" it somehow to point out to webpack to include it as runtime dependency in a final bundle.
     */
    if (CommManager == null) {
      return;
    }

    Jupyter.notebook.kernel.comm_manager.register_target(
      'neptune_comm',
      (comm: NbComm) => {
        comm.on_msg((msg: NbCommMsgMsg) => {
          callback(msg.content.data as NeptuneClientMsg);
        });
      }
    );
  }

  async saveNotebookAndOpenInNewWindow(path: string, content: any) {

    const url = Jupyter.utils.url_path_join(
      this.baseUrl,
      'notebooks',
      Jupyter.utils.encode_uri_components(path),
    );

    const options: NbNotebookDescriptor = {
      content,
      path,
      type: 'notebook',
    };

    await this.contentManager.save(path, options);

    const w = window.open(url, Jupyter._target);
    if (w === null) {
      throw "New window cannot be open.";
    }
  }

  async assertNotebook(path: string) {
    const options: NbNotebookDescriptor = {
      type: 'notebook',
      content: false,
    }

    await this.contentManager.get(path, options);
  }
}

export default Notebook;

