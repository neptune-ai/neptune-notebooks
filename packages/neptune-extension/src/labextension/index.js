
class Extension {

  constructor(app) {
    this.app = app;
    console.log('Running neptune labextension');
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

