import * as React from 'react';
import * as ReactModal from 'react-modal';

import {
  NeptuneConnection,
  INeptuneConnectionParams
} from './connection';
import { NeptuneContent } from './content';
import { NeptuneSession } from './kernel';
import '../style/configure-modal.css';


interface IConfigureModal {
  content: NeptuneContent;
  initParams: INeptuneConnectionParams;
  session: NeptuneSession;
  isOpen: boolean;
  onCreateNotebook: () => void;
  onClose: () => void;
}

interface IConfigureModalState {
  configureCompleted: boolean;
}

export class ConfigureModal extends React.PureComponent<IConfigureModal, IConfigureModalState> {
  private readonly content: NeptuneContent;
  private readonly session: NeptuneSession;
  private readonly localConnection: NeptuneConnection;

  constructor(props: IConfigureModal) {
    super(props);

    this.state = {
      configureCompleted: false
    };

    const {
      content,
      initParams,
      session
    } = this.props;

    this.content = content;
    this.session = session;
    this.localConnection = new NeptuneConnection({...initParams});

    console.log(
      this.content,
      this.session,
      this.localConnection
    );
  }


  renderCurrentStepHeader(): React.ReactElement<any> {
    let configureStepState = 'current';
    let configureAction = null;
    let configureStepNo  = <span>1</span>;
    let integrateStepState = '';

    if (this.state.configureCompleted) {
      configureStepState = 'completed';
      configureAction = this.backToConfigurationStep;
      configureStepNo = <i className="fa fa-check"></i>
      integrateStepState = 'current';
    }

    return (
      <React.Fragment>
        <div className={`n-ConfigurationStep n-ConfigurationStep--${configureStepState}`} onClick={configureAction}>
          <span className={`n-ConfigurationStep__stepNo n-ConfigurationStep__stepNo--${configureStepState}`}>{ configureStepNo }</span>
          Checkpoints
        </div>
        <div className="n-ConfigurationStepSeparator"></div>
        <div className={`n-ConfigurationStep n-ConfigurationStep--${integrateStepState}`}>
          <span className={`n-ConfigurationStep__stepNo n-ConfigurationStep__stepNo--${integrateStepState}`}>2</span>
          Integration
        </div>
      </React.Fragment>
    );
  }


  renderCurrentStepContent(): React.ReactElement<any> {
    if (!this.state.configureCompleted) {
      return this.renderConfigureStep();
    }
    return this.renderIntegrateStep();
  }

  renderConfigureStep(): React.ReactElement<any> {
    return (
      <React.Fragment>
        <div className="n-ConfigurationStepLead">API token and Project allows you to checkpoint and share your work in Neptune.</div>

        <label className="n-form-label" htmlFor="neptune-api-token">API token</label>
        <div className="n-form-item">
          [input]
        </div>

        <label className="n-form-label" htmlFor="neptune-project">Select project</label>
        <div className="n-form-item">
          [select]
        </div>
      </React.Fragment>
    );
  }

  renderIntegrateStep(): React.ReactElement<any> {
    return (
      <React.Fragment>
        <div className="n-ConfigurationStepLead n-ConfigurationStepLead-success">
          Initial checkpoint successful! Check <a href="#">this link</a> to see your notebook [NB_NAME].
        </div>

        <div className="n-form-label n-form-label--small">
          Integrate to create Neptune experiments and see them all linked to this notebook. Click "Integrate" to run the code below, then just "import neptune" and work as usual.
        </div>
        <div className="n-form-item">
          [textarea]
        </div>
      </React.Fragment>
    );
  }


  renderCurrentStepActions(): React.ReactElement<any> {
    const {
      onClose
    } = this.props;

    if (!this.state.configureCompleted) {
      return (
        <React.Fragment>
          <button type="button" className="n-ConfigureModalButton n-ConfigureModalButton--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="n-ConfigureModalButton n-ConfigureModalButton--primary" onClick={this.createNotebook}>Create notebook</button>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <button type="button" className="n-ConfigureModalButton n-ConfigureModalButton--secondary" onClick={this.backToConfigurationStep}>Do it later</button>
        <button type="button" className="n-ConfigureModalButton n-ConfigureModalButton--primary" onClick={this.integrateNotebook}>Integrate</button>
      </React.Fragment>
    );
  }


  private backToConfigurationStep = () => {
    this.setState({ configureCompleted: false });
  }


  private completeConfigurationStep = () => {
     this.setState({ configureCompleted: true });
  }


  private createNotebook = () => {
    this.props.onCreateNotebook();
    this.completeConfigurationStep();
  }


  private integrateNotebook = () => {
    // this.runCell();
    this.props.onClose();
  }


  // private runCell() {
  //   this.session.runInitializationCode(this.localConnection.getParams());
  // };


  render() {
    const {
      isOpen
    } = this.props;

    return (
      <ReactModal
        isOpen={isOpen}
        ariaHideApp={false}
        className="n-ConfigureModal"
        overlayClassName="n-ConfigureModalOverlay"
      >
        <div className="n-ConfigureModalHeader">
          { this.renderCurrentStepHeader() }
        </div>
        <div className="n-ConfigureModalBody">
          { this.renderCurrentStepContent() }
        </div>
        <div className="n-ConfigureModalFooter">
          { this.renderCurrentStepActions() }
        </div>
      </ReactModal>
    );
  }
}
