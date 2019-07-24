import * as React from 'react';
import { ReactWidget, ToolbarButtonComponent } from "@jupyterlab/apputils";

import {
  NeptuneConnection,
  INeptuneConnectionParams,
  setGlobalApiToken
} from './connection';
import { NeptuneContent } from './content';
import { NeptuneSession } from './kernel';
import { ConfigureModal } from './configure-modal';
import '../style/configure-button.css';


export class NeptuneConfigureButton extends ReactWidget {

  private readonly content: NeptuneContent;
  private readonly session: NeptuneSession;
  private readonly connection: NeptuneConnection;

  constructor(content: NeptuneContent, session: NeptuneSession, connection: NeptuneConnection) {
    super();
    this.content = content;
    this.session = session;
    this.connection = connection;
  }

  public render() {
    return (
      <ConfigureButton
        content={this.content}
        session={this.session}
        connection={this.connection}
      />
    );
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
    let cssClass = 'n-ConfigureButton';
    let iconCssClass;

    if (typeof isConfigurationValid !== 'boolean') {
      return null;
    }

    const label = isConfigurationValid ? ' ' : 'Configure';

    switch (uploadStatus) {
      case 'loading': {
        cssClass += ' n-ConfigureButton--loading';
        // 'n-ConfigureButton-icon fa fa-lg ' + glyph
        iconCssClass = 'n-ConfigureButton-icon fa fas fa-spinner fa-spin fa-w-14'
        break;
      }

      case 'success': {
        cssClass += ' n-ConfigureButton--success';
        iconCssClass = 'n-ConfigureButton-icon fa fa-check-circle'
        break;
      }

      case 'fail': {
        cssClass += ' n-ConfigureButton--failed';
        iconCssClass = 'n-ConfigureButton-icon fa fa-times-circle'
        break;
      }
    }

    return (
      <React.Fragment>
        <div className="n-Button-Wrapper">
          <ToolbarButtonComponent
            className={cssClass}
            iconClassName={iconCssClass}
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
      .then(() => connection.setParams(params))
      .then(() => setGlobalApiToken(params.apiToken))
      .then(() => this.uploadSuccess())
      .catch(() => this.uploadFail());
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
