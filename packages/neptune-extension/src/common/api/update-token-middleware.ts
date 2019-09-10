import {
  FetchParams, Middleware,
  RequestContext,
} from 'generated/backend-client/src';

import { getAccessToken } from "./auth";


export const updateTokenMiddleware: Middleware = {
  async pre(context: RequestContext): Promise<FetchParams | void> {
    // Headers is global constructor, see https://developer.mozilla.org/en-US/docs/Web/API/Headers
    const headers = new Headers(context.init.headers);

    const token = await getAccessToken();
    headers.set('Authorization', `Bearer ${token.accessToken}`);

    return {
      ...context,
      init: {
        ...context.init,
        headers,
      }
    }
  },
};
