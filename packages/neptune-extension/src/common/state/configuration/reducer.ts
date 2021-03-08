import {API_TOKEN_LOCAL_STORAGE_KEY, ApiTokenParsed, parseApiToken} from 'common/api/auth';
import {ConfigurationActions} from "./actions";

interface ConfigurationState {
  apiToken?: string
  apiTokenParsed?: ApiTokenParsed
  isApiTokenValid?: boolean
  inferredUsername?: string
  oldDomainApiUrl?: string
  newDomainApiUrl?: string
  oldDomainApplicationUrl?: string
  newDomainApplicationUrl?: string
}

const dummyInitialState: ConfigurationState = {};

export function createInitialConfigurationState(): ConfigurationState {
  const initialApiToken = localStorage.getItem(API_TOKEN_LOCAL_STORAGE_KEY) || undefined;
  const initialApiTokenParsed = initialApiToken ? parseApiToken(initialApiToken) : undefined;

  return {
    apiToken: initialApiToken,
    apiTokenParsed: initialApiTokenParsed,
  };
}

/* initial state should be provided in "createStore". */
export function configurationReducer(state: ConfigurationState = dummyInitialState, action:ConfigurationActions): ConfigurationState {
  switch (action.type) {
    case "API_TOKEN_SET": {

      // do not parse api token if it is the same, just return current state
      if (action.payload.token === state.apiToken) {
        return state;
      }

      return {
        ...state,
        apiToken: action.payload.token,
        apiTokenParsed: parseApiToken(action.payload.token),
      };
    }

    case "USERNAME_SET": {
      return {
        ...state,
        inferredUsername: action.payload.username,
      };
    }

    case "API_TOKEN_SET_VALID": {
      return {
        ...state,
        isApiTokenValid: action.payload.valid,
      }
    }

    case "CLIENT_CONFIG_SET": {
      const {
        newDomain,
        oldDomain,
      } = action.payload;
      return {
        ...state,
        newDomainApiUrl: newDomain.apiUrl,
        newDomainApplicationUrl: newDomain.applicationUrl,
        oldDomainApiUrl: oldDomain.apiUrl,
        oldDomainApplicationUrl: oldDomain.applicationUrl,
      }
    }

    default:
        return state;
  }
}
