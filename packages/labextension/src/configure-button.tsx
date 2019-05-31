import * as React from 'react';
import { ReactElementWidget, ToolbarButtonComponent } from "@jupyterlab/apputils";

import {
  NeptuneConnection,
  INeptuneConnectionParams,
  setGlobalApiToken
} from './connection';
import { NeptuneContent } from './content';
import { NeptuneSession } from './kernel';
import { ConfigureModal } from './configure-modal';
import '../style/configure-button.css';


export class NeptuneConfigureButton extends ReactElementWidget {
  constructor(content: NeptuneContent, session: NeptuneSession, connection: NeptuneConnection) {
    super(<ConfigureButton content={content} session={session} connection={connection} />);
  }
}


interface IConfigureButtonProps {
  connection: NeptuneConnection;
  content: NeptuneContent;
  session: NeptuneSession;
}

interface IConfigureButtonState {
  isConfigurationValid?: boolean;
  isModalOpen: boolean;
  uploadStatus?: string;
}

const TIMEOUT_TIME = 4000;

class ConfigureButton extends React.Component<IConfigureButtonProps, IConfigureButtonState> {
  timeout: number;

  constructor(props: Readonly<IConfigureButtonProps>) {
    super(props);

    this.state = {
      isModalOpen: false
    };
    this.validateConfiguration();
  }

  render() {
    const {
      content,
      session,
      connection
    } = this.props;
    const {
      isConfigurationValid,
      isModalOpen,
        uploadStatus,
    } = this.state;
    let label = '';
    let cssClass = 'n-ConfigureButton';

    if (typeof isConfigurationValid !== 'boolean') {
      return null;
    }

    if (!isConfigurationValid) {
      label = 'Configure';
    }
    let glyph = '';

    switch (uploadStatus) {
      case 'loading':
        cssClass += ' n-ConfigureButton--loading';
        glyph = 'fas fa-spinner fa-spin fa-w-14';
        break;
      case 'success':
        glyph = 'fa-check-circle';
        cssClass += ' n-ConfigureButton--success';
        break;
      case 'fail':
        cssClass += ' n-ConfigureButton--failed';
        glyph = 'fa-times-circle';
        break;
    }

    return (
      <React.Fragment>
        <div style={{position: 'relative'}}>
          <ToolbarButtonComponent
            className={cssClass}
            iconClassName={'n-ConfigureButton-icon fa fa-lg ' + glyph}
            label={label}
            onClick={this.openModal}
            tooltip='Connect to Neptune'
          />
          {
            uploadStatus === 'success' && (
                <div className="n-upload-notice">
                   Configuration successful
                </div>
            )
          }
          {
            uploadStatus === 'fail' && (
                <div className="n-upload-notice">
                   There was an error while configuring your notebook
                </div>
            )
          }
        </div>
        <ConfigureModal
          isOpen={isModalOpen}
          isConfigurationValid={isConfigurationValid}
          content={content}
          session={session}
          initParams={connection.getParams()}
          isLoading={uploadStatus === 'loading'}
          onCreating={this.uploadLoading}
          onCreateNotebook={this.updateMetadata}
          onCreateFail={this.uploadFail}
          onClose={this.closeModal}
        />
      </React.Fragment>
    );
  }


  private updateMetadata = (params: INeptuneConnectionParams) => {
    const {
      content,
      connection
    } = this.props;

    content.updateMetadata({ notebookId: params.notebookId })
        .then(() => this.validateConfiguration())
        .then( () => connection.setParams(params))
        .then( () => setGlobalApiToken(params.apiToken))
        .then( () => this.uploadSuccess())
        .catch(() => this.uploadFail())
  };

  uploadFail = () => {
    this.resetUpload();

    this.setState({ uploadStatus: 'fail' });
    this.timeout = setTimeout(() => this.resetUpload(), TIMEOUT_TIME);
  };

  uploadSuccess = () => {
    this.resetUpload();

    this.setState({ uploadStatus: 'success' });
    this.timeout = setTimeout(() => this.resetUpload(), TIMEOUT_TIME);
  };

  uploadLoading = () => {
    this.resetUpload();

    this.setState({ uploadStatus: 'loading' });
  };

  resetUpload = () => {
    clearTimeout(this.timeout);

    this.setState({uploadStatus: null})
  };

  private validateConfiguration = () => {
    const {
      connection,
      content
    } = this.props;

    return content
      .validateMetadata()
      .then(() => connection.validate())
      .then(() => this.setState({ isConfigurationValid: true }))
      .catch(() => this.setState({ isConfigurationValid: false }));
  }

  private openModal = () => {
    this.setState({ isModalOpen: true });
  }

  private closeModal = () => {
    this.setState({ isModalOpen: false });
  }
}
