import { Signal } from '@phosphor/signaling';


export interface INeptuneConnectionParams {
  apiToken: string;
  project: string;
  notebookId: string;
}


export class NeptuneConnection {

  private params: INeptuneConnectionParams;

  private _paramsChanged = new Signal<this, INeptuneConnectionParams>(this);

  constructor(params: INeptuneConnectionParams) {
    this.params = params;
  }

  getParams = () => {
    return this.params;
  };

  setParams = (params: INeptuneConnectionParams) => {
    this.params = params;
    this._paramsChanged.emit(params);
  };

  updateParams = (params: Partial<INeptuneConnectionParams>) => {
    this.setParams({
      ...this.params,
      ...params
    });
  };

  get paramsChanged(): Signal<this, INeptuneConnectionParams> {
    return this._paramsChanged;
  }

  listProjects = () => {
    return this
      .getAuthorizationHeader()
      .then(authorizationHeader => {
        return fetch(
            this.getApiAddress() + '/api/backend/v1/projects?userRelation=memberOrHigher',
            {
              headers: { 'Authorization': authorizationHeader }
            }
          )
          .then(response => response.json())
          .then(data => data.entries as Array<INeptuneProject>);
      });
  };

  validate = () => {
    return this.getAuthorizationHeader().then(() => Promise.resolve());
  };

  createNotebook = (path: string) => {
    return this.getAuthorizationHeader()
      .then(authorizationHeader => {
        return fetch(this.getApiAddress() + '/api/leaderboard/v1/notebooks' +
            '?projectIdentifier=' + this.params.project +
            '&jupyterPath=' + encodeURIComponent(path),
            {
              method: 'POST',
              headers: {
                'Authorization': authorizationHeader,
                'Content-Type': 'application/octet-stream'
              },
              body: '{}'
            }
          )
          .then(response => response.json())
          .then(data => data.id);
      });
  };

  getNotebook = () => {

    return this
      .getAuthorizationHeader()
      .then((authorizationHeader) => {
        if (!this.params.notebookId) {
          return {};
        }
        return fetch(
            this.getApiAddress() + '/api/leaderboard/v1/notebooks/' + this.params.notebookId,
            {
              headers: { 'Authorization': authorizationHeader }
            }
          )
          .then(response => response.json())
          .then(data => data as INeptuneNotebook);
      });
  };

  createCheckpoint = (path: string, content: string) => {
    return this.getAuthorizationHeader()
      .then(authorizationHeader => {
        return fetch(this.getApiAddress() + '/api/leaderboard/v1/notebooks/' + this.params.notebookId + '/checkpoints?jupyterPath=' + encodeURIComponent(path),
          {
            method: 'POST',
            headers: {
              'Authorization': authorizationHeader,
              'Content-Type': 'application/octet-stream'
            },
            body: content
          }
        ).then((response) => response.ok ? Promise.resolve(response.json()) : Promise.reject('Could not create notebook'));
      });
  };

  getUsername = () => {
    return this.getOAuthToken().then(oauthToken => oauthToken.username);
  };


  private getAuthorizationHeader = () => {
    return this.getOAuthToken().then(oauthToken => 'Bearer ' + oauthToken.accessToken);
  };

  private getOAuthToken = () => {
    let apiToken = this.params.apiToken;
    try {
      let decodedToken = JSON.parse(atob(apiToken));
      return fetch(decodedToken.api_address + '/api/backend/v1/authorization/oauth-token', {
          headers: {
            'X-Neptune-Api-Token': apiToken
          }
        })
        .then(response => response.json())
        .then(data => data as OAuthToken)
        .catch(err => Promise.reject(err));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  getApiAddress = () => {
    let { apiToken } = this.params;
    let decodedToken = JSON.parse(atob(apiToken));
    return decodedToken.api_address;
  };

}


export function createConnection(params: Partial<INeptuneConnectionParams>) {

  let connection = new NeptuneConnection({
    apiToken: params.apiToken,
    project: params.project,
    notebookId: params.notebookId
  });

  if (!params.project && params.notebookId) {
    return connection.getNotebook()
      .then(notebook =>
        connection
          .listProjects()
          .then(projects => {
            let project = projects.find(project => project.id === notebook.projectId);
            connection.updateParams({
              project: project.organizationName + '/' + project.name
            })
          })
      )
      .then(() => connection);
  } else {
    return Promise.resolve(connection);
  }
}


export function createEmptyConnection() {
  return new NeptuneConnection({
    apiToken: getGlobalApiToken() || null,
    project: null,
    notebookId: null
  });
}


export function getGlobalApiToken() {
  return window.localStorage.getItem('neptuneLabs:ApiToken') || '';
}


export function setGlobalApiToken(apiToken: string) {
  window.localStorage.setItem('neptuneLabs:ApiToken', apiToken);
}


interface OAuthToken {
  refreshToken: string;
  accessToken: string;
  username: string;
}


export interface INeptuneProject {
  id: string;
  organizationName: string;
  name: string;
}


export interface INeptuneNotebook {
  id: string;
  projectId: string;
  path: string;
  owner: string;
  creationTime: string;
  lastCheckpointId: string;
  name: string;
}
