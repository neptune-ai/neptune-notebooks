import * as React from 'react';
import { ReactElementWidget, ToolbarButtonComponent } from "@jupyterlab/apputils";

import { NeptuneConnection } from './connection';
import { NeptuneContent } from './content';
import { NeptuneSession } from './kernel';
import { ConfigureModal } from './configure-modal';
import '../style/configure-button.css';



export class NeptuneConfigureButton extends ReactElementWidget {
  constructor(props: IConfigureButtonProps) {
    super(<ConfigureButton {...props} />);
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
          content={content}
          session={session}
          initParams={connection.getParams()}
          onCreateNotebook={this.updateMetadata}
          onClose={this.closeModal}
        />
      </React.Fragment>
    );
  }


  private updateMetadata = () => {
    console.log('updateMetadata');
  }


  private validateConfiguration = () => {
    const {
      connection,
      content
    } = this.props;

    content.validateMetadata()
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