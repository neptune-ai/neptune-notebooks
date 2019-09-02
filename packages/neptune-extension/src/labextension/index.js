import { toStr } from 'src/dummy';

let counter = 1;

class Extension {

  constructor(app) {
    this.app = app;
    console.log('Running neptune labextension for the', toStr(counter++), 'time');
  }

  createNew(panel, context) {
    return;
  }
}

export default {
  id: 'neptune-notebook',
  autoStart: true,
  activate: (app) => {
    app.docRegistry.addWidgetExtension('Notebook', new Extension(app));
  }
}

