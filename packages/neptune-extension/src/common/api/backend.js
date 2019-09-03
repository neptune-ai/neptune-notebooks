import axios from 'axios';

export function getAccessToken() {
  /* TODO: local storage is only temporary. */
  const apiToken = window.localStorage.getItem('neptune_api_token');
  const decodedToken = JSON.parse(atob(apiToken));

  axios.defaults.baseURL = decodedToken.api_address;

  return axios.get('/api/backend/v1/authorization/oauth-token', {
    headers: {
      'X-Neptune-Api-Token': apiToken,
    },
  })
    .then(({ data }) => {
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    });
}

export function listProjects() {
  return axios.get('/api/backend/v1/projects?userRelation=memberOrHigher');
}

export function getNotebookData(notebookId) {
  return axios.get(`/api/leaderboard/v1/notebooks/${notebookId}`);
}

export function createNotebook() {
  /* TODO: local storage is only temporary. */
  const projectId = window.localStorage.getItem('neptune_api_project');

  return axios.post(`/api/leaderboard/v1/notebooks?projectIdentifier=${projectId}`);
}

export function createCheckpoint(notebookId, data, jupyterPath) {
  const options = {
    headers: {
      'content-type': 'application/octet-stream',
    },
  };

  return axios.post(`/api/leaderboard/v1/notebooks/${notebookId}/checkpoints?jupyterPath=${encodeURIComponent(jupyterPath)}`, data, options);
}

