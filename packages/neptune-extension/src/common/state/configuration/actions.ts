import {ThunkAction} from 'redux-thunk';
import {AnyAction} from 'redux';

import {DefaultApi as BackendApi} from 'generated/backend-client/src/apis';
import {Configuration as BackendApiConfiguration} from 'generated/backend-client/src';

import {backendClient} from 'common/api/backend-client';
import {leaderboardClient} from 'common/api/leaderboard-client';
import {API_TOKEN_LOCAL_STORAGE_KEY, ApiTokenParsed} from 'common/api/auth';
import {AppState} from 'common/state/reducers';

export function setApiToken(token: string) {
  localStorage.setItem(API_TOKEN_LOCAL_STORAGE_KEY, token);

  return {
    type: 'API_TOKEN_SET',
    payload: {
      token
    },
  } as const;
}

export function setApiTokenValid(valid: boolean) {
  return {
    type: 'API_TOKEN_SET_VALID',
    payload: {
      valid,
    },
  } as const;
}

export function setTokenUsername(username?: string) {
  return {
    type: 'USERNAME_SET',
    payload: {
      username: username,
    }
  } as const;
}

export function validateApiToken(apiToken: string, apiTokenParsed?: ApiTokenParsed): ThunkAction<void, AppState, {}, AnyAction > {
  return (dispatch) => {
    function invalidateToken() {
      dispatch(setApiTokenValid(false));
      dispatch(setTokenUsername(undefined));
    }

    if (apiTokenParsed === undefined) {
      invalidateToken();
      return;
    }

    // we need local instance of backend api as we don't know the api address before user provides api token
    const localBackendClient = new BackendApi(new BackendApiConfiguration({
      basePath: apiTokenParsed.api_address,
    }));

    localBackendClient
      .exchangeApiToken({ xNeptuneApiToken:apiToken })
      .then(accessToken => {
        dispatch(setApiTokenValid(true));
        dispatch(setTokenUsername(accessToken.username));

        // everything set up properly, lets set all API clients to use proper base bath
        backendClient.setBasePath(apiTokenParsed.api_address);
        leaderboardClient.setBasePath(apiTokenParsed.api_address);

      })
      .catch(() => invalidateToken())
  }
}

export type ConfigurationActions = ReturnType<typeof setApiToken | typeof setApiTokenValid | typeof setTokenUsername>
