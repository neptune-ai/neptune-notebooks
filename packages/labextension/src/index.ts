import {
  IDisposable,
  DisposableDelegate
} from '@phosphor/disposable';
import {
  JupyterLab,
  JupyterLabPlugin
} from '@jupyterlab/application';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  NotebookPanel,
  INotebookModel
} from '@jupyterlab/notebook';
import { ReactElementWidget } from '@jupyterlab/apputils';

import { NeptuneContent } from './content';
import { NeptuneSession } from './kernel';
import {
  createConnection,
  createEmptyConnection,
  getGlobalApiToken
} from './connection';

import { NeptuneConfigureButton } from './configure-button';
import { NeptuneUploadButton } from './upload';


/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class NeptuneNotebookExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  private readonly app: JupyterLab;

  constructor(app: JupyterLab) {
    this.app = app;
  }

  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    // Insert buttons into the toolbar before the first spacer
    let idx = 0;
    let namesIt = panel.toolbar.names();
    let name;
    // noinspection SuspiciousTypeOfGuard
    while ((name = namesIt.next()) && name !== undefined && name != 'spacer') {
      idx++;
    }

    let content = new NeptuneContent(context, this.app.serviceManager.contents);
    let session = new NeptuneSession(context.session);

    let buttonsPromise = content
      .getMetadata()
      .then(metadata => {
        return createConnection({
            apiToken: getGlobalApiToken(),
            notebookId: metadata.notebookId
          })
          .catch(() => Promise.resolve(createEmptyConnection()))
          .then(connection => {
            const neptuneConfigureButton = new NeptuneConfigureButton(content, session, connection);
            const neptuneUploadNotebookButton = new NeptuneUploadButton(content, connection);

            panel.toolbar.insertItem(idx++, 'neptune:configure', neptuneConfigureButton);
            panel.toolbar.insertItem(idx, 'neptune:uploadNotebook', neptuneUploadNotebookButton);

            return [
              neptuneConfigureButton,
              neptuneUploadNotebookButton
            ];
          });
    }) as Promise<Array<ReactElementWidget>>;

    return new DisposableDelegate(() => {
      return buttonsPromise.then(buttons =>
        buttons.forEach(button => button.dispose())
      );
    });
  }
}


/**
 * The plugin registration information.
 */
const plugin: JupyterLabPlugin<void> = {
  id: 'neptune-notebook',
  autoStart: true,
  activate: (app: JupyterLab) => {
    app.docRegistry.addWidgetExtension('Notebook', new NeptuneNotebookExtension(app));
  }
};


/**
 * Export the plugin as default.
 */
// noinspection JSUnusedGlobalSymbols
export default plugin;
