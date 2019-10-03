// Libs
import { combineReducers } from 'redux';

// Module
import { notebookReducer as notebook } from './notebook/reducer';
import { configurationReducer as configuration } from './configuration/reducer';
import { notificationsReducer as notifications } from './notifications/reducer';

const reducers = {
  configuration,
  notebook,
  notifications,
};

const rootReducer = combineReducers(reducers);

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
