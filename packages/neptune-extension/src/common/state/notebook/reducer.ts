import { NotebookActions } from './actions'
import { NotebookDTO } from 'generated/leaderboard-client/src/models';

interface NotebookState {
  fetchStatus: 'none' | 'pending' | 'success' | 'failure'
  notebook?: NotebookDTO
  uploadNotebookStatus: 'none' | 'pending' | 'success' | 'failure'
  uploadCheckpointStatus: 'none' | 'pending' | 'success' | 'failure'
}

const initialState: NotebookState = {
  fetchStatus: 'none',
  notebook: undefined,
  uploadCheckpointStatus: 'none',
  uploadNotebookStatus: 'none',
};

export function notebookReducer(state: NotebookState = initialState, action: NotebookActions): NotebookState {

  switch (action.type) {
    case "NOTEBOOK_UPLOAD_REQUEST": {
      return {
        ...state,
        uploadNotebookStatus: 'pending',
      }
    }

    case "NOTEBOOK_UPLOAD_SUCCESS": {
      return {
        ...state,
        uploadNotebookStatus: 'success',
      }
    }

    case "NOTEBOOK_UPLOAD_FAILED": {
      return {
        ...state,
        uploadNotebookStatus: 'failure',
      }
    }

    case "CHECKPOINT_UPLOAD_REQUEST": {
      return {
        ...state,
        uploadCheckpointStatus: 'pending',
      }
    }

    case "CHECKPOINT_UPLOAD_SUCCESS": {
      return {
        ...state,
        uploadCheckpointStatus: 'success',
      }
    }

    case "CHECKPOINT_UPLOAD_FAILED": {
      return {
        ...state,
        uploadCheckpointStatus: 'failure',
      }
    }

    case "NOTEBOOK_FETCH_REQUEST": {
      return {
        ...state,
        fetchStatus: 'pending',
      }
    }

    case "NOTEBOOK_FETCH_FAILED" : {
      return {
        ...state,
        fetchStatus: 'failure',
      }
    }

    case "NOTEBOOK_FETCH_SUCCESS": {
      return {
        ...state,
        notebook: action.payload.notebook,
        fetchStatus: 'success',
      };
    }

    default:
      return state;
  }
};
