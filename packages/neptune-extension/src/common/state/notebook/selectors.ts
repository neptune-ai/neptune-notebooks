import {AppState} from "common/state/reducers";

export function getNotebookState(state: AppState) {
  return state.notebook;
}

export function getNotebookLoadingState(state: AppState) {
  return state.notebook.uploadNotebookStatus === 'pending' || state.notebook.uploadCheckpointStatus === 'pending';
}

