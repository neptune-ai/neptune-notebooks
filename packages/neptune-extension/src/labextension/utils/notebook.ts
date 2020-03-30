import { JupyterLab } from '@jupyterlab/application';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';
import { Contents, Kernel, KernelMessage, Session } from '@jupyterlab/services';

import { get } from 'lodash';
import {
  PlatformNotebook,
  NeptuneClientMsg,
} from "types/platform";

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

  async saveWorkingCopyAndGetContent() {
    await this.context.save();

    // The function below returns the (saved) copy from disc.
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

  async executeKernelCode(code: string) {
    await this.context.sessionContext.ready;
    ((this.context.sessionContext.session as Session.ISessionConnection).kernel as Kernel.IKernelConnection).requestExecute({ code });
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
