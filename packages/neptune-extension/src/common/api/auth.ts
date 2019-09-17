import {
  Configuration,
  DefaultApi as BackendApi
} from 'generated/backend-client/src';

export interface ApiTokenParsed {
  api_address: string
  api_key: string
}

const backendClient = new BackendApi(new Configuration({
  basePath: getBasePath(),
}));

export const API_TOKEN_LOCAL_STORAGE_KEY = 'neptune_api_token';

export function getBasePath(): string {
  const apiToken = window.localStorage.getItem(API_TOKEN_LOCAL_STORAGE_KEY);
  const tokenParsed = parseApiToken(apiToken || '');

  return tokenParsed && tokenParsed.api_address || '';
}

export function parseApiToken(apiTokenStr: string): ApiTokenParsed | undefined {
  let token: ApiTokenParsed | undefined;

  try {
    token = JSON.parse(atob(apiTokenStr));
  } catch (e) {}

  return token
}

export async function getAccessToken() {
  const apiToken = window.localStorage.getItem(API_TOKEN_LOCAL_STORAGE_KEY);

  if (typeof apiToken === 'string') {
    return await backendClient.exchangeApiToken({ xNeptuneApiToken: apiToken })
  }

  return Promise.reject('Wrong apiToken');
}
