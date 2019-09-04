import {
  getAccessToken,
  getNotebookData,
} from 'common/api/backend';

export function validateConfiguration(metadata, token) {
  if (!metadata.notebookId) {
    // Notebook without neptune id - yet no setup.
    return Promise.reject();
  }

  if (!token) {
    // Token was deleted - do the setup again.
    return Promise.reject();
  }

  return new Promise((resolve, reject) => {
    getAccessToken(token)
      .then(({ data: authData }) => {

        getNotebookData(metadata.notebookId)
          .then(({ data: notebookData }) => {

            if (authData.username !== notebookData.owner) {
              // username changed.
              reject();
            }

            // Configuration ok!
            resolve();
          })
          .catch(() => {
            /*
             * No notebook - might have been deleted or environment changed
             * on development.
             */
            reject();
          });
      });
  });
}

