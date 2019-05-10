import {NeptuneConnection, NeptuneConnectionParams} from "./connection";
import {showDialog} from "@jupyterlab/apputils";
import * as React from "react";
import {ChangeEvent, ChangeEventHandler, MouseEventHandler} from "react";
import {NeptuneContent} from "./content";
import {getInitializationCode, NeptuneSession} from "./kernel";
import {UnControlled as CodeMirror} from "react-codemirror2";
import "../style/dialog.css";

export class NeptuneConnectionInfoDialog {

    private readonly content: NeptuneContent;
    private readonly kernel: NeptuneSession;
    private readonly localConnection: NeptuneConnection;

    constructor(content: NeptuneContent, kernel: NeptuneSession, initParams: NeptuneConnectionParams) {
        this.content = content;
        this.kernel = kernel;
        this.localConnection = new NeptuneConnection(Object.assign({}, initParams));
    }

    onCreateNotebookClick = () => {
        let connection = this.localConnection;
        return connection
            .createNotebook(this.content.getNotebookPath())
            .then(notebookId => {
                connection.updateParams({notebookId: notebookId});
                return this.content.getNotebookContent()
                    .then(content =>
                        connection.createCheckpoint(this.content.getNotebookPath(), content))
                    .then(() => notebookId);
            });
    };

    onRunCellClick = () => {
        this.kernel.runInitializationCode(this.localConnection.getParams());
    };

    show(): Promise<NeptuneConnectionParams | null> {
        return showDialog({
            title: 'Connect to Neptune',
            body: <NeptuneConnectionDialogContainer
                connection={this.localConnection}
                onConnectionParamsUpdate={this.localConnection.updateParams}
                onCreateNotebookClick={this.onCreateNotebookClick}
                onRunCellClick={this.onRunCellClick}/>
        }).then(result => {
            if (result.button.accept) {
                return this.localConnection.getParams();
            }
            return null;
        });
    }

}

interface ConnectionDialogContainerProps {

    connection: NeptuneConnection;
    onConnectionParamsUpdate: (params: Partial<NeptuneConnectionParams>) => void;
    onCreateNotebookClick: () => Promise<string>;
    onRunCellClick: () => void;

}

interface ConnectionDialogContainerState {

    apiToken?: string;
    isApiTokenValid?: boolean;
    selectedProject?: string;
    projectsList?: Array<string>;
    notebookId?: string

}

class NeptuneConnectionDialogContainer
    extends React.Component<ConnectionDialogContainerProps, ConnectionDialogContainerState> {

    constructor(props: Readonly<ConnectionDialogContainerProps>) {
        super(props);
        let {apiToken, project, notebookId} = this.props.connection.getParams();
        this.state = {
            apiToken: apiToken,
            isApiTokenValid: null,
            selectedProject: project,
            projectsList: null,
            notebookId: notebookId
        };
    }

    initializeDialog = () => {
        this.props.connection.validate()
            .then(() => {

                this.setState({isApiTokenValid: true});

                this.props.connection.listProjects()
                    .then(projects => this.setState({
                        projectsList: projects.map(project => project.organizationName + "/" + project.name)
                    }));

            }).catch(() => this.setState({isApiTokenValid: false}));
    };

    onTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
        let apiToken = event.target.value;
        this.props.onConnectionParamsUpdate({apiToken: apiToken});
        this.setState({apiToken: apiToken});
    };

    onProjectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        let project = event.target.value;
        this.props.onConnectionParamsUpdate({project: project});
        this.setState({selectedProject: project});
    };

    onCreateNotebookClick = () => {
        this.props.onCreateNotebookClick()
            .then(notebookId => {
                this.setState({notebookId: notebookId});
            });
    };

    onRunCellClick = () => {
        this.props.onRunCellClick()
    };

    componentDidMount(): void {
        this.initializeDialog();
    }

    componentDidUpdate(prevProps: Readonly<ConnectionDialogContainerProps>,
                       prevState: Readonly<ConnectionDialogContainerState>, snapshot?: any): void {
        if (prevState.apiToken !== this.state.apiToken) {
            this.initializeDialog();
        }
    }

    render(): React.ReactElement<any> {
        let {apiToken, isApiTokenValid, selectedProject, projectsList, notebookId} = this.state;

        return (
            <NeptuneConnectionDialog apiToken={apiToken}
                                     isApiTokenValid={isApiTokenValid}
                                     selectedProject={selectedProject}
                                     notebookId={notebookId}
                                     projectsList={projectsList}
                                     onTokenChange={this.onTokenChange}
                                     onProjectChange={this.onProjectChange}
                                     onCreateNotebookClick={this.onCreateNotebookClick}
                                     onRunCellClick={this.onRunCellClick}/>
        );
    }

}

interface NeptuneConnectionDialogProps {

    apiToken: string;

    isApiTokenValid: boolean;

    selectedProject: string;

    notebookId: string;

    projectsList: Array<string>;

    onTokenChange: ChangeEventHandler<HTMLInputElement>

    onProjectChange: ChangeEventHandler<HTMLSelectElement>

    onCreateNotebookClick: MouseEventHandler<HTMLInputElement>

    onRunCellClick: MouseEventHandler<HTMLInputElement>

}

class NeptuneConnectionDialog extends React.Component<NeptuneConnectionDialogProps> {

    ApiTokenStatus = () => {
        let {isApiTokenValid} = this.props;
        const glyphClass = isApiTokenValid ? "fa-check-circle" : "fa-times-circle";
        let iconVariant = "";
        if (isApiTokenValid === true) {
            iconVariant = "input-status-icon--valid";
        } else if (isApiTokenValid === false) {
            iconVariant = "input-status-icon--invalid";
        }
        const iconClasses = "input-status-icon fa " + glyphClass + " " + iconVariant;
        return (<i id="neptune-api-token-icon" className={iconClasses} />);
    };

    ApiTokenErrorMessage = () => {
        if (!this.props.isApiTokenValid) {
            return (<span id="neptune-api-token-msg" className="invalid-value-message">Invalid api token</span>);
        }
        return null;
    };

    ProjectsSelect = () => {
        let {selectedProject, projectsList, onProjectChange} = this.props;
        if (projectsList === null) {
            return (
                <select id="neptune-project" value={selectedProject} disabled={true}>
                    <option label={selectedProject} value={selectedProject}/>
                </select>
            );
        } else {
            return (
                <select id="neptune-project" value={selectedProject} onChange={onProjectChange}>
                    {projectsList.map(project =>
                        <option key={project} label={project} value={project}/>
                    )}
                </select>
            );
        }
    };

    render(): React.ReactElement<any> {
        let {
            apiToken, isApiTokenValid, selectedProject, notebookId,
            onTokenChange, onCreateNotebookClick, onRunCellClick
        } = this.props;


        let code = getInitializationCode({
            apiToken: apiToken,
            project: selectedProject,
            notebookId: notebookId
        });

        return (
            <div id="neptune-connection-info" className="jp-Dialog-body connect-dialog">
                <label htmlFor="neptune-api-token">Api token</label>
                <div className="input-with-status-icon">
                    <input id="neptune-api-token" type="text" defaultValue={apiToken}
                           onChange={onTokenChange}/>
                    <this.ApiTokenStatus/>
                </div>
                <this.ApiTokenErrorMessage />
                <label htmlFor="neptune-project">Project</label>
                <this.ProjectsSelect/>
                <label htmlFor="neptune-notebook">Notebook</label>
                <input type="button" value="Create and upload" onClick={onCreateNotebookClick}
                       disabled={!isApiTokenValid}/>
                <div>
                    <CodeMirror options={{mode: "python", readOnly: true}} value={code}/>
                </div>
                <input type="button" value="Run cell" onClick={onRunCellClick}/>
            </div>
        );
    }
}