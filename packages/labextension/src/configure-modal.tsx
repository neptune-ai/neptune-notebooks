import * as React from 'react';
import { ChangeEvent } from 'react';
import * as ReactModal from 'react-modal';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/python/python';

import {
  NeptuneConnection,
  INeptuneConnectionParams,
  INeptuneNotebook
} from './connection';
import { NeptuneContent } from './content';
import {
  NeptuneSession,
  getInitializationCode
} from './kernel';
import '../style/configure-modal.css';


enum STEP {
  CONFIGURATION,
  INTEGRATION
}

interface IConfigureModal {
  content: NeptuneContent;
  initParams: INeptuneConnectionParams;
  session: NeptuneSession;
  isOpen: boolean;
  isConfigurationValid: boolean;
  onCreateNotebook: (params: INeptuneConnectionParams) => void;
  onClose: () => void;
}

interface IConfigureModalState {
  error: string;
  visibleStep: STEP,
  notebookId?: string;
  notebook?: INeptuneNotebook;
  apiToken?: string;
  isApiTokenValid?: boolean;
  selectedProject?: string;
  projectsList?: Array<string>;
}

export class ConfigureModal extends React.Component<IConfigureModal, IConfigureModalState> {
  private readonly content: NeptuneContent;
  private readonly session: NeptuneSession;
  private readonly localConnection: NeptuneConnection;

  constructor(props: IConfigureModal) {
    super(props);

    const {
      content,
      initParams,
      session,
      isConfigurationValid
    } = this.props;

    this.content = content;
    this.session = session;
    this.localConnection = new NeptuneConnection({ ...initParams });

    const {
      apiToken,
      project,
      notebookId
    } = this.localConnection.getParams();

    this.state = {
      error: null,
      visibleStep: isConfigurationValid ? STEP.INTEGRATION : STEP.CONFIGURATION,
      apiToken,
      selectedProject: project,
      projectsList: null,
      notebookId
    };
  }


  componentDidMount(): void {
    this.initializeDialog();
  }


  componentDidUpdate(
    prevProps: Readonly<IConfigureModal>,
    prevState: Readonly<IConfigureModalState>,
    snapshot?: any
  ): void {
    if (prevState.apiToken !== this.state.apiToken) {
      this.initializeDialog();
    }

    if (
      prevProps.isOpen !== this.props.isOpen
      && this.props.isOpen
    ) {
      this.setState({
        visibleStep: this.props.isConfigurationValid ? STEP.INTEGRATION : STEP.CONFIGURATION
      });
    }
  }


  initializeDialog = () => {
    this.localConnection
      .validate()
      .then(() => {
        this.setState({ isApiTokenValid: true });

        this.localConnection
          .listProjects()
          .then(projects => this.setState({
            projectsList: projects.map(project => `${project.organizationName}/${project.name}`)
          }));

        this.localConnection
          .getNotebook()
          .then(notebook => {
            this.setState({ notebook });
          });
      })
      .catch(() => this.setState({ isApiTokenValid: false }));
  }


  renderCurrentStepHeader(): React.ReactElement<any> {
    let configureStepState = 'current';
    let configureAction = null;
    let configureStepNo  = <span>1</span>;
    let integrateStepState = '';

    if (this.state.visibleStep === STEP.INTEGRATION) {
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
    if (this.state.visibleStep === STEP.CONFIGURATION) {
      return this.renderConfigureStep();
    }
    return this.renderIntegrateStep();
  }

  renderConfigureStep(): React.ReactElement<any> {
    const { apiToken, error } = this.state;

    return (
      <React.Fragment>
        <div className="n-ConfigurationStepLead">API token and Project allows you to checkpoint and share your work in Neptune.</div>

        <label className="n-form-label" htmlFor="neptune-api-token">API token</label>
        <div className="n-form-item">
          <input
            id="neptune-api-token"
            className="n-form-input n-form-input-with-status"
            type="text"
            defaultValue={apiToken}
            title={apiToken}
            onChange={this.updateApiToken}
          />
          { this.renderApiTokenStatus() }
        </div>

        <label className="n-form-label" htmlFor="neptune-project">Select project</label>
        <div className="n-form-item">
          { this.renderProjectsSelect() }
          { this.renderProjectsStatus() }
        </div>
        { error && (
            <div className="n-form-error">{error}</div>
        )}
      </React.Fragment>
    );
  }


  renderApiTokenStatus = (): React.ReactElement<any> => {
    return this.renderInputStatus(this.state.isApiTokenValid);
  };


  renderProjectsSelect = (): React.ReactElement<any> => {
    const {
      selectedProject,
      projectsList
    } = this.state;

    return (
      <select id="neptune-project" className="n-form-input n-form-input-with-status" value={selectedProject} disabled={projectsList === null} onChange={this.updateSelectedProject}>
      {
        (projectsList === null) ? (
          <option label={selectedProject} value={selectedProject} />
        ) : (
          [
            <option value="" key="--">--Please choose the project--</option>,
            ...projectsList.map(project => <option key={project} label={project} value={project} />)
          ]
        )
      }
      </select>
    );
  }

  renderProjectsStatus = (): React.ReactElement<any> => {
    return this.renderInputStatus(!!this.state.selectedProject);
  }

  renderInputStatus(condition): React.ReactElement<any> {
    const glyphClass = condition ? 'fa-check-circle' : 'fa-times-circle';
    let iconVariant = '';
    if (condition === true) {
      iconVariant = 'n-input-status-icon--valid';
    } else if (condition === false) {
      iconVariant = 'n-input-status-icon--invalid';
    }
    const iconClasses = 'n-input-status-icon fa fa-lg ' + glyphClass + ' ' + iconVariant;
    return (<i id="neptune-api-token-icon" className={iconClasses} />);
  };


  getNotebookURI = () => {
    const {
      selectedProject,
      notebook
    } = this.state;

    if (!notebook) {
      return null;
    }

    const {
      id,
      name,
      lastCheckpointId
    } = notebook;
    const apiAddress = this.localConnection.getApiAddress();

    return `${apiAddress}\/${selectedProject}\/n\/${name}\-${id}\/${lastCheckpointId}`;
  }


  renderIntegrateStep(): React.ReactElement<any> {
    const {
      apiToken,
      selectedProject,
      notebookId,
      notebook
    } = this.state;

    const code = getInitializationCode({
      apiToken,
      project: selectedProject,
      notebookId
    });

    return (
      <React.Fragment>
        {
          (notebook) && (
            <div className="n-ConfigurationStepLead n-ConfigurationStepLead-success">
              Initial checkpoint successful! Check <a href={this.getNotebookURI()} target="_blank" rel="noopener noreferrer">this link</a> to see your notebook <em>{notebook.name}</em>.
            </div>
          )
        }

        <div className="n-form-label n-form-label--small">
          Integrate to create Neptune experiments and see them all linked to this notebook. Click "Integrate" to run the code below, then just "import neptune" and work as usual.
        </div>
        <div className="n-form-item">
          <CodeMirror
            className="notebook-integration-code"
            options={{
              mode: 'python',
              readOnly: true
            }}
            value={code}
          />
        </div>
      </React.Fragment>
    );
  }


  renderCurrentStepActions(): React.ReactElement<any> {
    const {
      onClose
    } = this.props;

    if (this.state.visibleStep === STEP.CONFIGURATION) {
      const requireParams = !this.state.isApiTokenValid || !this.state.selectedProject;
      const disabledClass = requireParams ? 'is-disabled' : '';

      return (
        <React.Fragment>
          <button
            type="button"
            className="n-ConfigureModalButton n-ConfigureModalButton--secondary"
            onClick={onClose}
          >Cancel</button>
          <button
            type="button"
            className={"n-ConfigureModalButton n-ConfigureModalButton--primary " + disabledClass}
            onClick={this.createNotebook}
            disabled={requireParams}
          >Create notebook</button>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <button
          type="button"
          className="n-ConfigureModalButton n-ConfigureModalButton--secondary"
          onClick={onClose}
        >Cancel</button>
        <button
          type="button"
          className="n-ConfigureModalButton n-ConfigureModalButton--primary"
          onClick={this.integrateNotebook}
        >Integrate</button>
      </React.Fragment>
    );
  }


  private updateApiToken = (ev: ChangeEvent<HTMLInputElement>) => {
    const apiToken = ev.target.value;

    this.localConnection.updateParams({ apiToken });
    this.setState({ apiToken });
  }


  private updateSelectedProject = (ev: ChangeEvent<HTMLSelectElement>) => {
    const project = ev.target.value;

    this.localConnection.updateParams({ project });
    this.setState({ selectedProject: project });
  }

  private backToConfigurationStep = () => {
    this.setState({ visibleStep: STEP.CONFIGURATION });
  }


  private completeConfigurationStep = () => {
    this.setState({ visibleStep: STEP.INTEGRATION });
  }


  private createNotebook = () => {
    this.setState({error: null});

    return this.localConnection
      .createNotebook(this.content.getNotebookPath())
      .then(notebookId => {
        this.localConnection.updateParams({ notebookId });
        this.content
          .getNotebookContent()
          .then(content => this.localConnection.createCheckpoint(this.content.getNotebookPath(), content))
          .then(() => {
            this.props.onCreateNotebook(this.localConnection.getParams());
            this.completeConfigurationStep();
            this.setState({ notebookId });
          })
            .catch(error => this.setState({error}));
      });
  }


  private integrateNotebook = () => {
    this
      .runCell()
      .then(() => {
        this.props.onClose()
      })
      .catch(err => {
        console.error('Integration failed', err);
      });
  }


  private runCell(): Promise<any> {
    return this.session.runInitializationCode(this.localConnection.getParams()).done;
  };


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
