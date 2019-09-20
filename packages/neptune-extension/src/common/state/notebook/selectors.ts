import {AppState} from "common/state/reducers";

export function getNotebookState(state: AppState) {
  return state.notebook;
}
