import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers';

import { createInitialConfigurationState } from './configuration/reducer';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose
  }
}

export default function configure () {
  const middlewares: Middleware[] = [
    thunkMiddleware
  ];

  let composeFunc = compose;

  if (APP_ENV === 'development') {
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
      composeFunc = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    } else {
      middlewares.push(
        createLogger(),
      );
    }
  }

  const initialState = {
    configuration: createInitialConfigurationState(),
  };

  const composedEnhancers = composeFunc(applyMiddleware(...middlewares));

  return createStore(rootReducer, initialState, composedEnhancers);
}
