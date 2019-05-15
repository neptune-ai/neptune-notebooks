import { Kernel } from '@jupyterlab/services';
import { IClientSession } from '@jupyterlab/apputils';
import { INeptuneConnectionParams } from './connection';


export class NeptuneSession {

  private readonly session: IClientSession;

  constructor(session: IClientSession) {
    this.session = session;
  }

  runInitializationCode(params: INeptuneConnectionParams): Kernel.IFuture {
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
  let code = 'import os';

  if (apiToken) {
      code += "\nos.environ['NEPTUNE_API_TOKEN']=\"" + apiToken + "\"";
  } else {
      code += "\n# os.environ['NEPTUNE_API_TOKEN']"
  }
  if (project) {
      code += "\nos.environ['NEPTUNE_PROJECT']=\"" + project + "\"";
  } else {
      code += "\n# os.environ['NEPTUNE_PROJECT']"
  }
  if (notebookId) {
      code += "\nos.environ['NEPTUNE_NOTEBOOK_ID']=\"" + notebookId + "\"";
  } else {
      code += "\n# os.environ['NEPTUNE_NOTEBOOK_ID']"
  }

  return code;
}
