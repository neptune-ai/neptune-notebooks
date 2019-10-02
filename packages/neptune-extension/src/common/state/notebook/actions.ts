import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux';
import {CheckpointDTO, NotebookDTO, NotebookWithNoContentDTO} from 'generated/leaderboard-client/src/models';
import { leaderboardClient } from "common/api/leaderboard-client";
import { PlatformNotebook } from 'types/platform';
import { addNotification } from 'common/state/notifications/actions';
import { AppState } from 'common/state/reducers';

export const fetchNotebook = (notebookId: string): ThunkAction<Promise<NotebookDTO | void>, {}, {}, NotebookActions> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(fetchNotebookRequest());

    try {
      const notebook = await leaderboardClient.api.getNotebook({ id: notebookId });

      dispatch(fetchNotebookSuccess(notebook));

      return notebook;
    } catch (err) {
      dispatch(fetchNotebookFailed());

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
  checkpointMeta: CheckpointMetadata,
  content: any,
  platformNotebook: PlatformNotebook,
): ThunkAction<Promise<NotebookWithNoContentDTO | void>, AppState, {}, NotebookActions> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(uploadNotebookRequest());

    try {
      const notebook = await leaderboardClient.api.createNotebook({projectIdentifier});
      await requestCheckpoint(notebook.id, checkpointMeta, content);
      await platformNotebook.saveNotebookId(notebook.id);
      await dispatch(fetchNotebook(notebook.id));

      dispatch(uploadNotebookSuccess(notebook));

      dispatch(addNotification({
        type: 'checkpoint-successful',
        data: {
          projectIdentifier,
          notebookId: notebook.id,
        }
      }));

      return notebook;
    } catch (err) {
      const message = (err && err.status === 422)
        ? 'Storage limit has been reached. Notebook can\'t be created.'
        : 'Error while uploading notebook.';
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

export const uploadCheckpoint = (projectIdentifier: string, notebookId: string, checkpointMeta: CheckpointMetadata, content: any)
  : ThunkAction<Promise<CheckpointDTO | void>, AppState, {}, NotebookActions> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {

    dispatch(uploadCheckpointRequest());

    try {
      const checkpoint = await requestCheckpoint(notebookId, checkpointMeta, content);
      await dispatch(fetchNotebook(notebookId));
      dispatch(uploadCheckpointSuccess(checkpoint));
      dispatch(addNotification({
        type: 'checkpoint-successful',
        data: {
          projectIdentifier,
          notebookId,
          checkpointId: checkpoint.id,
        }
      }));

      return checkpoint;

    } catch (err) {
      const message = (err && err.status === 422)
        ? 'Storage limit has been reached. Checkpoint can\'t be uploaded.'
        : 'Error while uploading notebook.';
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

async function requestCheckpoint(notebookId: string, checkpointMeta: CheckpointMetadata, content: any) {
  const checkpoint = await leaderboardClient.api.createEmptyCheckpoint({
    notebookId,
    checkpoint: checkpointMeta,
  });

  await leaderboardClient.api.uploadCheckpointContent({
    id: checkpoint.id,
    content,
  });

  return checkpoint;
}
