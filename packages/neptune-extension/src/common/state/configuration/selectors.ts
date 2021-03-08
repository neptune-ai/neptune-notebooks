import {AppState} from "common/state/reducers";

export function getConfigurationState(state: AppState) {
  return state.configuration;
}

export function getApplicationUrl(state: AppState, domainVersion: number | undefined) {
  const configuration = getConfigurationState(state);

  if (domainVersion === 2) {
    return configuration.newDomainApplicationUrl;
  }

  return configuration.oldDomainApplicationUrl;
}
