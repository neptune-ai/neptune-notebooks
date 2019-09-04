import {
  getAccessToken,
  getNotebookData,
  createNotebook,
  createCheckpoint,
} from 'common/api/backend';

export function uploadNotebook(metadata, token, projectId, content) {
  return new Promise((resolve, reject) => {
    getAccessToken(token)
      .then(() => {
        createNotebook(projectId)
          .then(({ data: notebookData }) => {
            createCheckpoint(notebookData.id, content, metadata.path)
              .then(() => resolve(notebookData))
              .catch(reject);
          })
          .catch(reject);
      });
  });
}

export function uploadCheckpoint(metadata, token, content) {
  return new Promise((resolve, reject) => {
    getAccessToken(token)
      .then(({ data: authData }) => {
        getNotebookData(metadata.notebookId)
          .then(({ data: notebookData }) => {

            if (!notebookData) {
              reject('You don\'t have access to this notebook, details in configuration');
              return;
            }

            if (notebookData.owner !== authData.username) {
              reject('You are not the owner of this notebook. Please create a new copy.');
              return;
            }

            if (notebookData.path !== metadata.path) {
              reject('Notebook was previously uploaded under different path.');
              return;
            }

            createCheckpoint(metadata.notebookId, content, metadata.path)
              .then(resolve)
              .catch(reject);
          })
          .catch(reject);
      });
  });
}

