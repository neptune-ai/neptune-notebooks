import * as React from 'react';
import {
  ReactElementWidget,
  ToolbarButtonComponent
} from '@jupyterlab/apputils';
import {
  NeptuneConnection,
  setGlobalApiToken
} from './connection';
import { NeptuneConnectionInfoDialog } from './dialog';
import { NeptuneContent } from './content';
import { NeptuneSession } from './kernel';
import '../style/configure.css';


export class NeptuneConfigureButton extends ReactElementWidget {
  constructor(content: NeptuneContent, session: NeptuneSession, connection: NeptuneConnection) {
    super(<ConfigureButton content={content} session={session} connection={connection}/>);
  }
}


interface IConfigureButtonProps {
  content: NeptuneContent;
  session: NeptuneSession;
  connection: NeptuneConnection;
}

interface IConfigureButtonState {
  isConfigurationValid: boolean;
}

class ConfigureButton extends React.Component<IConfigureButtonProps, IConfigureButtonState> {

  constructor(props: Readonly<IConfigureButtonProps>) {
    super(props);
    this.state = {
      isConfigurationValid: false
    };
    this.validateConfiguration();
  }

  render(): React.ReactElement<any> {
    let label = '';
    let cssClass = 'n-ConfigureButton';

    if (!this.state.isConfigurationValid) {
      label = 'Configure';
      cssClass += ' n-ConfigureButton--withLabel';
    }

    return (
      <ToolbarButtonComponent
        className={cssClass}
        label={label}
        onClick={this.showConfigureDialog}
        tooltip='Connect to Neptune'
      />
    );
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

  private showConfigureDialog = () => {
    const {
      content,
      session,
      connection
    } = this.props;

    if (this.state.isConfigurationValid) {
      console.log('Connection is configured');
    } else {
      console.warn('Connection needs to be configured');
    }

    new NeptuneConnectionInfoDialog(content, session, connection.getParams())
      .show()
      .then(params => {
        if (params !== null) {
          connection.setParams(params);
          setGlobalApiToken(params.apiToken);
          return content.updateMetadata({
              notebookId: params.notebookId
            })
            .then(() => this.validateConfiguration());
        }
      });
  }
}
