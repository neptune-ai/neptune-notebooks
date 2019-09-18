import {
  FetchParams, Middleware,
  RequestContext,
} from 'generated/backend-client/src';

import { authClient } from "./auth";


export const updateTokenMiddleware: Middleware = {
  async pre(context: RequestContext): Promise<FetchParams | void> {
    // Headers is global constructor, see https://developer.mozilla.org/en-US/docs/Web/API/Headers
    const headers = new Headers(context.init.headers);

    const token = await authClient.getAccessToken();
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
