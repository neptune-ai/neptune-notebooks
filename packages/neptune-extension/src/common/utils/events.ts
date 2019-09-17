import {
  isFunction,
  isPlainObject,
} from 'lodash';

export type EventHandler = (event: MouseEvent | object, params?: object) => void;

interface HandlerObject {
  handler: EventHandler
  payload: any
}

function decomposeEventHandler(eventHandler?: EventHandler | HandlerObject) : [EventHandler?, HandlerObject?] {
  if (isFunction(eventHandler)) {
    return [eventHandler, undefined];
  }

  if (eventHandler && isPlainObject(eventHandler)) {
    const {
      handler,
      payload,
    } = eventHandler;
    if (isFunction(handler)) {
      return [handler, payload];
    }
  }

  return [undefined, undefined];
}

export function getEventHandler(eventHandler?: EventHandler, eventParams?: object, returnEvent = true) {
  const [handler, payload] = decomposeEventHandler(eventHandler);

  if (!handler) {
    return;
  }

  const baseParams = payload ? {...eventParams, payload} : {...eventParams};

  if (returnEvent) {
    return (event: MouseEvent) => handler(event, baseParams);
  }
  return (params: object) => handler({...baseParams, ...params});
}
