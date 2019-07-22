import { Kernel, KernelMessage } from '@jupyterlab/services';
import { IClientSession } from '@jupyterlab/apputils';
import { INeptuneConnectionParams } from './connection';


export class NeptuneSession {

  private readonly session: IClientSession;

  constructor(session: IClientSession) {
    this.session = session;
  }

  runInitializationCode(params: INeptuneConnectionParams): Kernel.IShellFuture<KernelMessage.IExecuteRequestMsg, KernelMessage.IExecuteReplyMsg> {
    return this.session.kernel.requestExecute({
      code: getInitializationCode(params)
    });
  }
}


export function getInitializationCode(params: INeptuneConnectionParams): string {
  const {
    apiToken,
    project,
    notebookId
  } = params;
  return `import os
${envEntry('NEPTUNE_API_TOKEN', apiToken)}
${envEntry('NEPTUNE_PROJECT', project)}
${envEntry('NEPTUNE_NOTEBOOK_ID', notebookId)}`;
}


function envEntry(key, value) {
  const disableComment = value ? '' : '# ';
  const keyValue = value ? `="${value}"` : '';

  return `${disableComment}os.environ['${key}']${keyValue}`;
}
