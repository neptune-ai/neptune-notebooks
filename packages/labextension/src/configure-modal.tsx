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
  UploadDialog,
  STRATEGY,
} from './upload';
import {
  NeptuneSession,
  getInitializationCode
} from './kernel';
import '../style/configure-modal.css';
import {Dialog, showDialog} from "@jupyterlab/apputils";


enum STEP {
  CONFIGURATION,
  INTEGRATION
}

interface IConfigureModal {
  content: NeptuneContent;
  initParams: INeptuneConnectionParams;
  isLoading: boolean;
  session: NeptuneSession;
  isOpen: boolean;
  isConfigurationValid: boolean;
  onCreateNotebook: (params: INeptuneConnectionParams) => void;
  onCreating: () => void;
  onCreateFail: () => void;
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
  conflictResolveStrategy?: string;
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
    prevState: Readonly<IConfigureModalState>
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
        this.setState({
          isApiTokenValid: true,
          projectsList: null
        });

        const promises = [];
        promises.push(this.localConnection
          .listProjects()
          .then(projects => {
            this.setState({
              projectsList: projects.map(project => `${project.organizationName}/${project.name}`)
            });
            return projects;
          })
        );

        if (this.localConnection.getParams().notebookId) {
          promises.push(this.localConnection
            .getNotebook()
            .then(notebook => {
              this.setState({ notebook });
              return notebook;
            })
          );
        }

        Promise.all(promises)
        .then(([projects, notebook]) => {
          if (notebook && notebook.projectId) {
            const project = projects.find(project => project.id === notebook.projectId);
            this.setState({selectedProject: `${project.organizationName}/${project.name}`});
          }
        });

      })
      .catch(() => this.setState({
        isApiTokenValid: false,
        projectsList: null,
        selectedProject: undefined
      }));
  };


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
            ...projectsList.map(project => <option key={project} value={project}>{project}</option>)
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
      const requireParams = !this.state.isApiTokenValid || !this.state.selectedProject || this.props.isLoading;
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

    this.props.onCreating();

    Promise.all([
        this.localConnection.getNotebook(),
        this.localConnection.getUsername(),
        this.localConnection.listProjects(),
        this.content.getMetadata(),
      ])
      .then(([notebook, username, projects, metadata]) => {
        if (notebook.id === metadata.notebookId) {
          if (notebook.owner === username) {
            const project = projects.find(project => project.id === notebook.projectId);
            if (`${project.organizationName}/${project.name}` === this.localConnection.getParams().project) {
              if (this.content.getNotebookPath() === notebook.path) {
                return this.askUser('Nothing has changed.', notebook.id);
              } else {
                return this.askUser('Notebook path has changed.', notebook.id);
              }
            } else {
              return this.askUser('Project has changed.', notebook.id);
            }
          }
        }
        return this.createNotebookFlow();
      })
      .catch((status) => {
        this.props.onCreateFail();
        this.setState({error : status === 422 ? 'Storage limit has been reached. Notebook can\'t be created.' : 'Could not create notebook'});
      })
      .then(() => {
        this.localConnection
          .getNotebook()
          .then(notebook => {
            this.setState({ notebook });
            window.localStorage.setItem('neptuneLabs:projectIdentifier', this.state.selectedProject);
          });
      });
  }

  updateResolveStrategy = (conflictResolveStrategy) => {
    this.setState({conflictResolveStrategy});
  }

  askUser = (textPrompt, notebookId) => {
    return showDialog({
        body: <UploadDialog header={textPrompt} onUpdateResolveStrategyChange={this.updateResolveStrategy} />,
        buttons: [
          Dialog.createButton({ label: 'Cancel', accept: false }),
          Dialog.createButton({ label: 'Apply', accept: true })
        ]
      })
      .then(result => {
        if (result.button.accept) {
          if (this.state.conflictResolveStrategy === STRATEGY.create) {
            return this.createNotebookFlow();
          } else {
            return this.createCheckpointFlow(notebookId);
          }
        } else {
          return Promise.reject();
        }
      });
  }

  createCheckpointFlow = (notebookId) => {
    this.localConnection.updateParams({ notebookId });
    return this.content
      .saveContent()
      .then(this.content.getNotebookContent)
      .then(content => this.localConnection.createCheckpoint(this.content.getNotebookPath(), content))
      .then(() => {
        this.props.onCreateNotebook(this.localConnection.getParams());
        this.completeConfigurationStep();
        this.setState({ notebookId });
      });
  }

  createNotebookFlow = () => {
    return this.localConnection
      .createNotebook(this.content.getNotebookPath())
      .then(this.createCheckpointFlow);
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
