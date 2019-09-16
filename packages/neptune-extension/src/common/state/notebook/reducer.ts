import { Reducer } from 'redux';

interface NotebookState {
  notebook: string,
}

const initialState: NotebookState = {
  notebook: 'test'
};

export const notebookReducer: Reducer<NotebookState> = (state = initialState) => {
  return state;
};
