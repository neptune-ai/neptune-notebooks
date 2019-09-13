// Libs
import { combineReducers } from 'redux';

// Module
import notebook from './notebook/reducer';

const reducers = {
  notebook,
};

export default combineReducers(reducers);
