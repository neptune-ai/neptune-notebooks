import * as React from 'react';
import { ChangeEvent } from 'react';
import {
  Dialog,
  ReactElementWidget,
  showDialog,
  ToolbarButtonComponent
} from '@jupyterlab/apputils';

import { NeptuneConnection, INeptuneProject } from './connection';
import { NeptuneContent } from './content';
import '../style/upload.css';


export const STRATEGY = {
  continue: 'continue',
  create: 'create'
};

export class NeptuneUploadButton extends ReactElementWidget {
  constructor(content: NeptuneContent, connection: NeptuneConnection) {
    super(<UploadButton connection={connection} content={content}/>);
  }
}


interface IUploadButtonProps {
  content: NeptuneContent;
  connection: NeptuneConnection;
}

interface IUploadButtonState {
  isUploadAvailable: boolean;
  uploadStatus?: string;
  conflictResolveStrategy: string;
  notebook?: any;
  projects?: Array<INeptuneProject>;
}

const TIMEOUT_TIME = 4000;

class UploadButton extends React.Component<IUploadButtonProps, IUploadButtonState> {
  timeout: number;

  constructor(props: Readonly<IUploadButtonProps>) {
    super(props);
    this.state = {
      conflictResolveStrategy: STRATEGY.continue,
      isUploadAvailable: false,
    };
    this.props.connection.paramsChanged.connect(() => {
      this.validateUpload()
    });
    this.validateUpload();
  }

  render(): React.ReactElement<any> {
    let className = 'n-UploadButton';
    let glyph = 'fa-arrow-circle-up';

    switch (this.state.uploadStatus) {
      case 'loading':
        glyph = 'fas fa-spinner fa-spin fa-w-14';
        break;
      case 'success':
        className += ' n-UploadButton--success';
        break;
      case 'fail':
        className += ' n-UploadButton--failed';
        glyph = 'fa-times-circle';
        break;
    }

    return (
        <div className="n-Button-Wrapper">
          <ToolbarButtonComponent
              className={className}
              iconClassName={'fa fa-lg ' + glyph}
              label='Upload'
              onClick={this.uploadNotebook}
              tooltip='Upload to Neptune'
              enabled={this.state.isUploadAvailable}
          />
          {
            (this.state.uploadStatus === 'success') && (
                <div className="n-upload-notice">
                  Successfully uploaded! To see notebook in Neptune, go to <a href={this.getNotebookURI()} target="_blank" rel="noopener noreferrer">link</a>.
                </div>
            )
          }
          {
            (this.state.uploadStatus === 'fail') && (
                <div className="n-upload-notice">
                  An error occurred during notebook upload. Please try again.
                </div>
            )
          }
        </div>
    );
  }

  getNotebookURI = () => {
    if (!this.state.notebook) {
      return null;
    }

    const {
      id,
      name,
      lastCheckpointId,
      projectId,
    } = this.state.notebook;

    const apiAddress = this.props.connection.getApiAddress();
    const project = this.state.projects.find(project => project.id === projectId);

    return `${apiAddress}\/${project.organizationName}/${project.name}\/n\/${name}\-${id}\/${lastCheckpointId}`;
  }

  private validateUpload = () => {
    const {
      connection,
      content
    } = this.props;

    content
      .validateMetadata()
      .then(() => connection.validate())
      .then(() => {
        return connection.getNotebook().then(notebook => {
          return connection.getUsername().then(username => {
            if (notebook.owner !== username) {
              return Promise.reject('Notebook has different owner');
            }
          });
        });
      })
      .then(() => this.setState({isUploadAvailable: true}))
      .catch(() => this.setState({isUploadAvailable: false}));
  };


  updateResolveStrategy = (strategy: string) => {
    this.setState({
      conflictResolveStrategy: strategy
    });
  }


  private uploadNotebook = () => {
    const {
      connection,
      content
    } = this.props;
    const path = content.getNotebookPath();

    this.setLoading();

    connection
      .getNotebook()
      .then(notebook => {
        if (!notebook.id) {
          return this.createNotebook();
        }
        this.setState({notebook});

        if (notebook.path !== path) {
          return showDialog({
              body: <UploadDialog onUpdateResolveStrategyChange={this.updateResolveStrategy} />,
              buttons: [
                Dialog.createButton({ label: 'Cancel', accept: false }),
                Dialog.createButton({ label: 'Apply', accept: true })
              ]
            })
            .then(result => {
              if (result.button.accept) {
                if (this.state.conflictResolveStrategy === STRATEGY.create) {
                  return this.createNotebook();
                }
              } else {
                return Promise.reject();
              }
            });
        }
      })
      .then(() => {
        return content
          .getNotebookContent()
          .then(notebookContent => connection.createCheckpoint(path, notebookContent));
      })
      .then(() => connection.listProjects().then((entries: Array<INeptuneProject>) => this.setState({projects: entries})))
      .then(() => this.setUploaded() )
      .catch(() => this.setRejected() );
  };

  createNotebook = () => {
    const {
      connection,
      content,
    } = this.props;

    return connection
      .createNotebook(content.getNotebookPath())
      .then(notebookId => connection.updateParams({ notebookId }));
  }

  resetUploadState() {
    clearTimeout(this.timeout);
    this.setState({ uploadStatus: null});
  };

  setLoading = () => {
    this.resetUploadState();
    this.setState({uploadStatus: 'loading'});
  };

  setUploaded = () => {
    this.resetUploadState();
    this.setState({uploadStatus: 'success'});
    this.timeout = setTimeout(() => this.resetUploadState(), TIMEOUT_TIME);
  };

  setRejected= () => {
    this.resetUploadState();
    this.setState({uploadStatus: 'fail'});
    this.timeout = setTimeout(() => this.resetUploadState(), TIMEOUT_TIME);
  };
}


interface IUploadDialogProps {
  header?: string;
  onUpdateResolveStrategyChange: (strategy: string) => void;
}

export class UploadDialog extends React.Component<IUploadDialogProps> {
  updateResolveStrategy = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.onUpdateResolveStrategyChange(event.target.value);
  };

  render(): React.ReactElement<any> {
    const text = this.props.header || 'Notebook name has changed.';
    return (
      <div className="n-UploadDialog">
        <p className="n-UploadDialog__note">
          {text} How would you like to continue?
        </p>

        <label className="n-UploadDialog__option-label">
          <input
            className="n-UploadDialog__option"
            type="radio"
            name="strategy"
            value={STRATEGY.continue}
            checked
            onChange={this.updateResolveStrategy}
          />
          Append checkpoint to this notebook
        </label>

        <label className="n-UploadDialog__option-label">
          <input
            className="n-UploadDialog__option"
            type="radio"
            name="strategy"
            value={STRATEGY.create}
            onChange={this.updateResolveStrategy}
          />
          Create new notebook in Neptune
        </label>
      </div>
    );
  }
}
