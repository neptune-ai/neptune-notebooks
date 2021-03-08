import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux';
import {CheckpointDTO, NotebookDTO, NotebookWithNoContentDTO} from 'generated/leaderboard-client/src/models';
import { leaderboardClient } from "common/api/leaderboard-client";
import { PlatformNotebook } from 'types/platform';
import { addNotification } from 'common/state/notifications/actions';
import { AppState } from 'common/state/reducers';
import { logger } from 'common/utils/logger';

const log = logger.extend('notebook-actions');

export const fetchNotebook = (projectVersion: number | undefined, notebookId: string): ThunkAction<Promise<NotebookDTO | void>, {}, {}, NotebookActions> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    log('fetchNotebook', notebookId);
    dispatch(fetchNotebookRequest());

    try {
      const notebook = await leaderboardClient.getApi(projectVersion).getNotebook({ id: notebookId });

      dispatch(fetchNotebookSuccess(notebook));
      log('fetchNotebook success', notebook);

      return notebook;
    } catch (err) {
      dispatch(fetchNotebookFailed());
      log('fetchNotebook failed', err);
      return;
    }
  };
};

function fetchNotebookRequest() {
  return { type: 'NOTEBOOK_FETCH_REQUEST' } as const;
}

function fetchNotebookSuccess(notebook: NotebookDTO) {
  return { type: 'NOTEBOOK_FETCH_SUCCESS', payload: {notebook} } as const;
}

function fetchNotebookFailed() {
  return { type: 'NOTEBOOK_FETCH_FAILED'} as const;
}

interface CheckpointMetadata {
  path: string
  name: string
  description: string
}

export const uploadNotebook = (
  projectIdentifier: string,
  projectVersion: number | undefined,
  checkpointMeta: CheckpointMetadata,
  content: any,
  platformNotebook: PlatformNotebook,
): ThunkAction<Promise<NotebookWithNoContentDTO | void>, AppState, {}, NotebookActions> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    log('uploadNotebook', projectIdentifier, checkpointMeta, content);
    dispatch(uploadNotebookRequest());

    try {
      const notebook = await leaderboardClient.getApi(projectVersion).createNotebook({projectIdentifier});
      log('uploadNotebook, empty notebook created', notebook);
      await requestCheckpoint(projectVersion, notebook.id, checkpointMeta, content);
      log('uploadNotebook, checkpoint created, content uploaded');
      await platformNotebook.setMetadata({
        notebookId: notebook.id,
        projectVersion,
      });

      dispatch(uploadNotebookSuccess(notebook));

      dispatch(addNotification({
        type: 'checkpoint-successful',
        data: {
          projectIdentifier,
          projectVersion,
          notebookId: notebook.id,
        }
      }));

      return notebook;
    } catch (err) {
      const message = (err && err.status === 422)
        ? 'Storage limit has been reached. Notebook can\'t be created.'
        : 'Error while uploading notebook.';
      log('uploadNotebook error', err);
      dispatch(uploadNotebookFailed());
      dispatch(addNotification({
        type: 'error',
        data: message,
      }));
      return;
    }
  };
};

function uploadNotebookRequest() {
  return { type: 'NOTEBOOK_UPLOAD_REQUEST' } as const;
}

function uploadNotebookSuccess(notebook: NotebookWithNoContentDTO) {
  return { type: 'NOTEBOOK_UPLOAD_SUCCESS', payload: { notebook }} as const;
}

function uploadNotebookFailed() {
  return { type: 'NOTEBOOK_UPLOAD_FAILED' } as const;
}

export const uploadCheckpoint = (projectIdentifier: string, projectVersion: number | undefined, notebookId: string, checkpointMeta: CheckpointMetadata, content: any)
  : ThunkAction<Promise<CheckpointDTO | void>, AppState, {}, NotebookActions> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    log('uploadCheckpoint', projectIdentifier, notebookId, checkpointMeta, content);

    dispatch(uploadCheckpointRequest());

    try {
      const checkpoint = await requestCheckpoint(projectVersion, notebookId, checkpointMeta, content);
      await dispatch(fetchNotebook(projectVersion, notebookId));
      dispatch(uploadCheckpointSuccess(checkpoint));
      log('uploadCheckpoint success');
      dispatch(addNotification({
        type: 'checkpoint-successful',
        data: {
          projectIdentifier,
          projectVersion,
          notebookId,
          checkpointId: checkpoint.id,
        }
      }));

      return checkpoint;

    } catch (err) {
      const message = (err && err.status === 422)
        ? 'Storage limit has been reached. Checkpoint can\'t be uploaded.'
        : 'Error while uploading notebook.';

      log('uploadCheckpoint error', err);
      dispatch(uploadCheckpointFailed());
      dispatch(addNotification({
        type: 'error',
        data: message,
      }));
      return;
    }
  }
};

function uploadCheckpointRequest() {
  return { type: 'CHECKPOINT_UPLOAD_REQUEST' } as const;
}

function uploadCheckpointSuccess(checkpoint: CheckpointDTO) {
  return { type: 'CHECKPOINT_UPLOAD_SUCCESS', payload: {checkpoint} } as const;
}

function uploadCheckpointFailed() {
  return { type: 'CHECKPOINT_UPLOAD_FAILED' } as const;
}

export type NotebookActions = ReturnType<
  typeof fetchNotebookRequest
  | typeof fetchNotebookSuccess
  | typeof fetchNotebookFailed
  | typeof uploadNotebookRequest
  | typeof uploadNotebookSuccess
  | typeof uploadNotebookFailed
  | typeof uploadCheckpointRequest
  | typeof uploadCheckpointSuccess
  | typeof uploadCheckpointFailed
>

async function requestCheckpoint(projectVersion: number | undefined, notebookId: string, checkpointMeta: CheckpointMetadata, content: any) {
  log('requestCheckpoint', notebookId, checkpointMeta, content);
  const checkpoint = await leaderboardClient.getApi(projectVersion).createEmptyCheckpoint({
    notebookId,
    checkpoint: checkpointMeta,
  });

  log('requestCheckpoint, empty checkpoint created', checkpoint);

  await leaderboardClient.getApi(projectVersion).uploadCheckpointContent({
    id: checkpoint.id,
    content,
  });

  log('requestCheckpoint, content properly uploaded');

  return checkpoint;
}
