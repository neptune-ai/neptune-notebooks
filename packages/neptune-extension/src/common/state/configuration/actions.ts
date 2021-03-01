import {API_TOKEN_LOCAL_STORAGE_KEY} from 'common/api/auth';

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

type ClientConfig = {apiUrl: string, applicationUrl: string}
export function setClientConfig(clientConfig: { newDomain: ClientConfig, oldDomain: ClientConfig }) {
  return {
    type: 'CLIENT_CONFIG_SET',
    payload: clientConfig,
  } as const;
}

export type ConfigurationActions = ReturnType<
  | typeof setApiToken
  | typeof setApiTokenValid
  | typeof setTokenUsername
  | typeof setClientConfig
>
