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

export type ConfigurationActions = ReturnType<typeof setApiToken | typeof setApiTokenValid | typeof setTokenUsername>
