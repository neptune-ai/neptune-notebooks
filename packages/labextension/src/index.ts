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

import '../style/index.css';
import { NeptuneConfigure } from './configure';
import { NeptuneContent } from './content';
import { NeptuneSession } from './kernel';
import {
  createConnection,
  createEmptyConnection,
  getGlobalApiToken
} from './connection';
import { NeptuneUpload } from './upload';


/**
 * The plugin registration information.
 */
const plugin: JupyterLabPlugin<void> = {
  activate,
  id: 'neptune-notebook',
  autoStart: true
};


/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  private readonly app: JupyterLab;

  constructor(app: JupyterLab) {
    this.app = app;
  }

  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
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
          .then(connection => {
            let neptuneConfigure = new NeptuneConfigure(content, session, connection);
            let neptuneUpload = new NeptuneUpload(content, connection);

            panel.toolbar.insertItem(idx++, 'configure-neptune', neptuneConfigure);
            panel.toolbar.insertItem(idx, 'upload-notebook', neptuneUpload);

            return [neptuneConfigure, neptuneUpload];
          })
          .catch(() => {
            let connection = createEmptyConnection();
            let neptuneConfigure = new NeptuneConfigure(content, session, connection);
            let neptuneUpload = new NeptuneUpload(content, connection);

            panel.toolbar.insertItem(idx++, 'configure-neptune', neptuneConfigure);
            panel.toolbar.insertItem(idx, 'upload-notebook', neptuneUpload);

            return [neptuneConfigure, neptuneUpload];
          });
    }) as Promise<Array<ReactElementWidget>>;

    return new DisposableDelegate(() =>
      buttonsPromise.then(buttons =>
        buttons.forEach(button => button.dispose())
      )
    );
  }
}


/**
 * Activate the extension.
 */
function activate(app: JupyterLab) {
  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension(app));
}


// noinspection JSUnusedGlobalSymbols
/**
 * Export the plugin as default.
 */
export default plugin;
