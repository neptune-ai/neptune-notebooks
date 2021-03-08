import { JupyterLab } from '@jupyterlab/application';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';
import { Contents, Kernel, KernelMessage, Session } from '@jupyterlab/services';

import { get } from 'lodash';
import {
  EditablePlatformNotebookMetadata,
  NeptuneClientMsg,
  PlatformNotebook,
} from "types/platform";
import { logger } from 'common/utils/logger';

interface NeptuneContextMetadata {
  notebookId?: string
  projectVersion?: number
}

const log = logger.extend('platform-notebook');
class Notebook implements PlatformNotebook {
  context: DocumentRegistry.IContext<INotebookModel>;
  app: JupyterLab;

  constructor(
    context: DocumentRegistry.IContext<INotebookModel>,
    app: JupyterLab,
  ) {
    this.context = context;
    this.app = app;
    log('Platform notebook created');
  };

  async saveWorkingCopyAndGetContent() {
    await this.context.save();

    // The function below returns the (saved) copy from disc.
    const file = await this.app.serviceManager.contents.get(this.context.path, { content: true });

    return file.content;
  };

  getMetadata() {
    const neptuneMetadata = this.context.model.metadata.get('neptune');
    const notebookId = get(neptuneMetadata, 'notebookId');
    const projectVersion = get(neptuneMetadata, 'projectVersion');

    return {
      path: this.context.path,
      notebookId,
      projectVersion,
    };
  };

  async setMetadata(metadata: EditablePlatformNotebookMetadata) {
    const contextMetadata = this.context.model.metadata;

    const neptuneMetadata = contextMetadata.has('neptune')
      ? contextMetadata.get('neptune') as NeptuneContextMetadata
      : {};

    contextMetadata.set('neptune', { ...neptuneMetadata, ...metadata });

    return this.context.save();
  };

  executeKernelCode(code: string) {
    this.context.sessionContext.ready.then(() => {
      ((this.context.sessionContext.session as Session.ISessionConnection).kernel as Kernel.IKernelConnection).requestExecute({ code });
    });
  }

  async registerNeptuneMessageListener(callback: (msg: NeptuneClientMsg) => void) {
    await this.context.sessionContext.ready;
    ((this.context.sessionContext.session as Session.ISessionConnection).kernel as Kernel.IKernelConnection).registerCommTarget(
      'neptune_comm',
      (comm: Kernel.IComm, openMsg: KernelMessage.ICommOpenMsg) => {
        comm.onMsg = (msg: KernelMessage.ICommMsgMsg): void => {
          callback(msg.content.data as any as NeptuneClientMsg);
        };
    });
  }

  async saveNotebookAndOpenInNewWindow(path: string, content: any) {
    const options: Partial<Contents.IModel> = {
      content,
      type: 'notebook',
    };

    await this.app.serviceManager.contents
      .save(path, options);

    return await this.app.commands.execute('docmanager:open', {
      path,
      factory: 'Notebook',
    });
  }

  async assertNotebook(path: string) {
    const options: Contents.IFetchOptions = {
      type: 'notebook',
      content: false,
    }

    await this.app.serviceManager.contents
      .get(path, options);
  }
}

export default Notebook
