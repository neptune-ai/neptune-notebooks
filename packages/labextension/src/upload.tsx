import * as React from "react";
import { Dialog, ReactElementWidget, showDialog, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { NeptuneConnection } from "./connection";
import { NeptuneContent } from "./content";
import '../style/upload.css';
import createButton = Dialog.createButton;


export class NeptuneUpload extends ReactElementWidget {
  constructor(content: NeptuneContent, connection: NeptuneConnection) {
    super(<UploadButton connection={connection} content={content}/>);
  }
}


class UploadButton extends React.Component<UploadButtonProps, UploadButtonState> {

  constructor(props: Readonly<UploadButtonProps>) {
    super(props);
    this.state = {
      isUploadAvailable: false
    };
    this.props.connection.paramsChanged.connect(() => this.validateUpload());
    this.validateUpload();
  }

  render(): React.ReactElement<any> {
    let className = 'n-UploadButton'

    switch (this.state.uploadStatus) {
      case true:
        className += ' n-UploadButton--success';
        break;
      case false:
        className += ' n-UploadButton--failed';
        break;
    }

    return (
      <ToolbarButtonComponent
        className={className}
        iconClassName='fa fa-lg fa-arrow-circle-up'
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

    content.validateMetadata()
      .then(() => connection.validate())
      .then(() => {
        return connection.getNotebook().then(notebook => {
          return connection.getUsername().then(username => {
            if (notebook.owner !== username) {
              return Promise.reject("Notebook has different owner");
            }
          });
        });
      })
      .then(() => this.setState({isUploadAvailable: true}))
      .catch(() => this.setState({isUploadAvailable: false}));
  };

  private onUploadButtonClick = () => {
    const {
      connection,
      content
    } = this.props;
    const path = content.getNotebookPath();

    content.getNotebookContent().then(notebookContent => {
      connection.getNotebook().then(notebook => {
        if (notebook.path !== path) {
          showDialog({
            title: "Path changed",
            body: "Notebook's path has changed. Would you like to create a new Neptune's notebook?",
            buttons: [
              createButton({
                label: "create a new notebook",
                accept: true
              }),
              createButton({
                label: "continue with current notebook",
                accept: false
              })
            ]
          })
            .then(result => {
              if (result.button.accept) {
                return connection.createNotebook(content.getNotebookPath())
                  .then(notebookId => connection.updateParams({notebookId: notebookId}));
              }
            })
            .then(() => connection.createCheckpoint(path, notebookContent));
        }
      });
    });

    content.getNotebookContent()
      .then(notebookContent => connection.createCheckpoint(content.getNotebookPath(), notebookContent))
      .then(() => this.setState({ uploadStatus: true }))
      .catch(() => this.setState({ uploadStatus: false }));
  };

}


interface UploadButtonProps {
  content: NeptuneContent;
  connection: NeptuneConnection;
}


interface UploadButtonState {
  isUploadAvailable: boolean;
  uploadStatus?: boolean;
}
