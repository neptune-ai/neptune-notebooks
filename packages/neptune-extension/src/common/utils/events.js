import {
  isFunction,
  isPlainObject,
} from 'lodash';

function decomposeEventHandler(eventHandler) {
  if (isFunction(eventHandler)) {
    return [eventHandler];
  }

  if (isPlainObject(eventHandler)) {
    const {
      handler,
      payload,
    } = eventHandler;
    if (isFunction(handler)) {
      return [handler, payload];
    }
  }

  return [];
}

export function getEventHandler(eventHandler, eventParams, returnEvent = true) {
  const [handler, payload] = decomposeEventHandler(eventHandler);

  if (!handler) {
    return;
  }

  const baseParams = payload ? {...eventParams, payload} : {...eventParams};

  if (returnEvent) {
    return (event) => handler(event, baseParams);
  }
  return (params) => handler({...baseParams, ...params});
}
