import {
  Configuration as BackendApiConfiguration,
  Configuration,
  DefaultApi as BackendApi,
  NeptuneOauthToken,
} from 'generated/backend-client/src';

export interface ApiTokenParsed {
  api_address: string
  api_key: string
}

export const API_TOKEN_LOCAL_STORAGE_KEY = 'neptune_api_token';

class AuthClient {
  private backendClient: BackendApi;

  constructor() {
    this.backendClient = this.createClient(getBasePath());
  }

  createClient(basePath: string) {
    return new BackendApi(new Configuration({
      basePath,
      middleware: [
      ]
    }));
  }

  setBasePath(path: string) {
    this.backendClient = this.createClient(path);
  }

  async getAccessToken() {
    const apiToken = window.localStorage.getItem(API_TOKEN_LOCAL_STORAGE_KEY);

    if (typeof apiToken === 'string') {
      return await exchangeApiTokenWithTimeout(this.backendClient, apiToken);
    }

    return Promise.reject('Wrong apiToken');
  }

  async validateToken(apiToken: string) {
    const apiTokenParsed = parseApiToken(apiToken);

    if (apiTokenParsed === undefined) {
      return Promise.reject("Can't parse provided token");
    }

    // we need local instance of backend api as we don't know the api address before user provides api token
    const localBackendClient = new BackendApi(new BackendApiConfiguration({
      basePath: apiTokenParsed.api_address,
    }));

    const accessToken = await exchangeApiTokenWithTimeout(localBackendClient, apiToken);
    const oldDomainClientConfig = await localBackendClient.getClientConfig({
      xNeptuneApiToken: apiToken,
    });

    const newDomainClientConfig = await localBackendClient.getClientConfig({
      xNeptuneApiToken: apiToken,
      alpha: String(true),
    });

    return {
      apiTokenParsed,
      accessToken,
      oldDomainClientConfig,
      newDomainClientConfig,
    }
  }
}

export const authClient = new AuthClient();


// static helpers }}
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

async function exchangeApiTokenWithTimeout(backend: BackendApi, apiToken: string): Promise<NeptuneOauthToken> {
  return await Promise.race<Promise<NeptuneOauthToken>>([
    new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    ),
    backend.exchangeApiToken({ xNeptuneApiToken: apiToken })
  ]);
}
// static helpers {{
