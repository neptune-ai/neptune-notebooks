// Libs
import { combineReducers } from 'redux';

// Module
import { checkoutReducer as checkout } from './checkout/reducer';
import { notebookReducer as notebook } from './notebook/reducer';
import { configurationReducer as configuration } from './configuration/reducer';

const reducers = {
  checkout,
  configuration,
  notebook,
};

const rootReducer = combineReducers(reducers);

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
