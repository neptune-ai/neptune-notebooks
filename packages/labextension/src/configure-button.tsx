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
  isConfigurationValid: boolean;
  isModalOpen: boolean;
}

class ConfigureButton extends React.Component<IConfigureButtonProps, IConfigureButtonState> {

  constructor(props: Readonly<IConfigureButtonProps>) {
    super(props);

    this.state = {
      isConfigurationValid: false,
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
      isModalOpen
    } = this.state;
    let label = '';
    let cssClass = 'n-ConfigureButton';

    if (!isConfigurationValid) {
      label = 'Configure';
      cssClass += ' n-ConfigureButton--withLabel';
    }

    return (
      <React.Fragment>
        <ToolbarButtonComponent
          className={cssClass}
          label={label}
          onClick={this.openModal}
          tooltip='Connect to Neptune'
        />
        <ConfigureModal
          isOpen={isModalOpen}
          isConfigurationValid={isConfigurationValid}
          content={content}
          session={session}
          initParams={connection.getParams()}
          onCreateNotebook={this.updateMetadata}
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

    this.validateConfiguration()
        .then(() => content.updateMetadata({ notebookId: params.notebookId }))
        .then( () => connection.setParams(params))
        .then( () => setGlobalApiToken(params.apiToken))
  }

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
