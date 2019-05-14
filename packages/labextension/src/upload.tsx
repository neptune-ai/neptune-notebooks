import * as React from 'react';
import { ChangeEvent } from 'react';
import {
  Dialog,
  ReactElementWidget,
  showDialog,
  ToolbarButtonComponent
} from '@jupyterlab/apputils';

import { NeptuneConnection } from './connection';
import { NeptuneContent } from './content';
import '../style/upload.css';
import createButton = Dialog.createButton;


const STRATEGY = {
  continue: 'continue',
  create: 'create'
};

export class NeptuneUpload extends ReactElementWidget {
  constructor(content: NeptuneContent, connection: NeptuneConnection) {
    super(<UploadButton connection={connection} content={content}/>);
  }
}


class UploadButton extends React.Component<UploadButtonProps, UploadButtonState> {

  constructor(props: Readonly<UploadButtonProps>) {
    super(props);
    this.state = {
      isUploadAvailable: false,
      conflictResolveStrategy: STRATEGY.continue
    };
    this.props.connection.paramsChanged.connect(() => this.validateUpload());
    this.validateUpload();
  }

  render(): React.ReactElement<any> {
    let className = 'n-UploadButton';
    let glyph = 'fa-arrow-circle-up';

    switch (this.state.uploadStatus) {
      case true:
        className += ' n-UploadButton--success';
        break;
      case false:
        className += ' n-UploadButton--failed';
        glyph = 'fa-times-circle';
        break;
    }

    return (
      <ToolbarButtonComponent
        className={className}
        iconClassName={'fa fa-lg ' + glyph}
        label='Upload'
        onClick={this.onUploadButtonClick}
        tooltip='Upload to Neptune'
        enabled={this.state.isUploadAvailable}
      />
    );
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


  private onUploadButtonClick = () => {
    const {
      connection,
      content
    } = this.props;
    const path = content.getNotebookPath();

    connection
      .getNotebook()
      .then(notebook => {
        if (notebook.path !== path) {
          return showDialog({
              body: <UploadDialog onUpdateResolveStrategyChange={this.updateResolveStrategy} />,
              buttons: [
                createButton({ label: 'Cancel', accept: false }),
                createButton({ label: 'Apply', accept: true })
              ]
            })
            .then(result => {
              if (result.button.accept) {
                if (this.state.conflictResolveStrategy === STRATEGY.create) {
                  return connection
                    .createNotebook(content.getNotebookPath())
                    .then(notebookId => connection.updateParams({ notebookId }));
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
      .then(() => this.setState({ uploadStatus: true }) )
      .catch(() => this.setState({ uploadStatus: false }) );
  };
}


interface UploadDialogProps {
  onUpdateResolveStrategyChange: (strategy: string) => void
}


class UploadDialog extends React.Component<UploadDialogProps> {
  updateResolveStrategy = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.onUpdateResolveStrategyChange(event.target.value);
  }

  render(): React.ReactElement<any> {
    return (
      <div className="n-UploadDialog">
        <p className="n-UploadDialog__note">
          Notebook name has changed. How would you like to continue?
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


interface UploadButtonProps {
  content: NeptuneContent;
  connection: NeptuneConnection;
}


interface UploadButtonState {
  isUploadAvailable: boolean;
  uploadStatus?: boolean;
  conflictResolveStrategy: string;
}
