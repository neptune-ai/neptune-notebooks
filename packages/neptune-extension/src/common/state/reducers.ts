// Libs
import { combineReducers } from 'redux';

// Module
import { notebookReducer as notebook } from './notebook/reducer';

const reducers = {
  notebook,
};

const rootReducer = combineReducers(reducers);

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
