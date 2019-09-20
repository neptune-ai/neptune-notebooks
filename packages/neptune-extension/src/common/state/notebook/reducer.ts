import { Reducer } from 'redux';
import { NotebookActions } from './actions'
import { NotebookDTO } from 'generated/leaderboard-client/src/models';

interface NotebookState {
  loaded: boolean
  notebook?: NotebookDTO
}

const initialState: NotebookState = {
  loaded: false,
  notebook: undefined
};

export function notebookReducer(state: NotebookState = initialState, action: NotebookActions): NotebookState {
  switch (action.type) {
    case "SET_NOTEBOOK": {
      return {
        ...state,
        notebook: action.payload.notebook,
        loaded: true
      };
    }

    default:
      return state;
  }
};
