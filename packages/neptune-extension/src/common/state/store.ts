import {
  applyMiddleware,
  compose,
  createStore,
  Middleware,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers';

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

  if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeFunc = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  } else {
    middlewares.push(
      createLogger(),
    );
  }
  const composedEnhancers = composeFunc(applyMiddleware(...middlewares));

  return createStore(rootReducer, undefined, composedEnhancers);
}
