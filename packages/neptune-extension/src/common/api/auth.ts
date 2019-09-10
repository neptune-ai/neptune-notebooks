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

export function getBasePath(): string {
  const apiToken = window.localStorage.getItem('neptuneLabs:ApiToken');
  let token: ApiTokenParsed | null = null;

  try {
    token = JSON.parse(atob(apiToken || ''));
  } catch (e) {}

  return token && token.api_address || '';
}

export async function getAccessToken(){
  const apiToken = window.localStorage.getItem('neptuneLabs:ApiToken');

  if (typeof apiToken === 'string') {
    return await backendClient.exchangeApiToken({ xNeptuneApiToken: apiToken })
  }

  return Promise.reject('Wrong apiToken');
}
