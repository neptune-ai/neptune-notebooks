import { Signal } from "@phosphor/signaling";

import { NeptuneConnectionParams } from "./connection";


export interface NeptuneConnectionParams {
  apiToken: string;
  project: string;
  notebookId: string;
}


export class NeptuneConnection {

  private params: NeptuneConnectionParams;

  private _paramsChanged = new Signal<this, NeptuneConnectionParams>(this);

  constructor(params: NeptuneConnectionParams) {
    this.params = params;
  }

  getParams = () => {
    return this.params;
  };

  setParams = (params: NeptuneConnectionParams) => {
    this.params = params;
    this._paramsChanged.emit(params);
  };

  updateParams = (params: Partial<NeptuneConnectionParams>) => {
    this.setParams({
      ...this.params,
      ...params
    });
  };

  get paramsChanged(): Signal<this, NeptuneConnectionParams> {
    return this._paramsChanged;
  }

  listProjects = () => {
    return this
      .getAuthorizationHeader()
      .then(authorizationHeader => {
        return fetch(
            this.getApiAddress() + "/api/backend/v1/projects2?userRelation=memberOrHigher",
            {
              headers: { "Authorization": authorizationHeader }
            }
          )
          .then(response => response.json())
          .then(data => data.entries as Array<Project>)
    });
  };

  validate = () => {
    return this.getAuthorizationHeader().then(() => Promise.resolve());
  };

  createNotebook = (path: string) => {
    return this.getAuthorizationHeader()
      .then(authorizationHeader => {
        return fetch(this.getApiAddress() + "/api/leaderboard/v1/notebooks" +
            "?projectIdentifier=" + this.params.project +
            "&jupyterPath=" + path,
            {
              method: "POST",
              headers: {
                "Authorization": authorizationHeader,
                "Content-Type": "application/octet-stream"
              },
              body: "{}"
            }
          )
          .then(response => response.json())
          .then(data => data.id)
      });
  };

  getNotebook = () => {
    return this
      .getAuthorizationHeader()
      .then(authorizationHeader => {
        return fetch(
            this.getApiAddress() + "/api/leaderboard/v1/notebooks/" + this.params.notebookId,
            {
              headers: { "Authorization": authorizationHeader }
            }
          )
          .then(response => response.json())
          .then(data => data as Notebook);
    });
  };

  createCheckpoint = (path: string, content: string) => {
    this.getAuthorizationHeader().then(authorizationHeader => {
      return fetch(this.getApiAddress() + "/api/leaderboard/v1/notebooks/" + this.params.notebookId + "/checkpoints?jupyterPath=" + path,
        {
          method: "POST",
          headers: {
            "Authorization": authorizationHeader,
            "Content-Type": "application/octet-stream"
          },
          body: content
        }
      );
    });
  };

  getUsername = () => {
    return this.getOAuthToken().then(oauthToken => oauthToken.username);
  };

  private getAuthorizationHeader = () => {
    return this.getOAuthToken().then(oauthToken => "Bearer " + oauthToken.accessToken);
  };

  private getOAuthToken = () => {
    let apiToken = this.params.apiToken;
    try {
      let decodedToken = JSON.parse(atob(apiToken));
      return fetch(decodedToken.api_address + "/api/backend/v1/authorization/oauth-token", {
          headers: {
            "X-Neptune-Api-Token": apiToken
          }
        })
        .then(response => response.json())
        .then(data => data as OAuthToken)
        .catch(err => Promise.reject(err));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  private getApiAddress = () => {
    let { apiToken } = this.params;
    let decodedToken = JSON.parse(atob(apiToken));
    return decodedToken.api_address;
  };

}

export function createConnection(params: Partial<NeptuneConnectionParams>) {

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
              project: project.organizationName + "/" + project.name
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
    apiToken: null,
    project: null,
    notebookId: null
  });
}


export function getGlobalApiToken() {
  return window.localStorage.getItem("neptune_api_token") || "";
}


export function setGlobalApiToken(apiToken: string) {
  window.localStorage.setItem("neptune_api_token", apiToken);
}


interface OAuthToken {
  refreshToken: string;
  accessToken: string;
  username: string;
}


interface Project {
  id: string;
  organizationName: string;
  name: string;
}


interface Notebook {
  id: string;
  projectId: string;
  path: string;
  owner: string;
  creationTime: string;
}
