import {
  isFunction,
  isPlainObject,
} from 'lodash';

export type EventHandler = (event: MouseEvent | object, params?: object) => void;
type HandlersArray = [EventHandler, HandlerObject?] | [];

interface HandlerObject {
  handler: EventHandler
  payload: any
}

function decomposeEventHandler(eventHandler?: EventHandler | HandlerObject) : HandlersArray {
  if (isFunction(eventHandler)) {
    return [eventHandler];
  }

  if (isHandlerObject(eventHandler)) {
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

function isHandlerObject(obj: any): obj is HandlerObject {
  return isPlainObject(obj) && isFunction(obj.handler);
}
