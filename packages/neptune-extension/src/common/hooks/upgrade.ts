import React from 'react';
import { useSelector } from 'react-redux'

import { checkVersion } from 'common/api/version';

import { getConfigurationState } from 'common//state/configuration/selectors';

declare var NBEXTENSION_VERSION: string

export function createUpgradeHandler() {

  if (PLATFORM !== 'nbextension') {
    return;
  }

  const {
    apiTokenParsed,
  } = useSelector(getConfigurationState);

  React.useEffect(() => {
    if (apiTokenParsed) {
      const url = apiTokenParsed.api_address;

      if (url && !url.endsWith('neptune.ml')) {
        // Disable for on prem installations
        return;
      }

      checkVersion().then(latestVersion => {
        if (NBEXTENSION_VERSION !== latestVersion) {
          // TODO: implement upgrade
          console.log(`Latest version is ${latestVersion}, but found ${NBEXTENSION_VERSION}`);
        }
      })
    }

  }, [apiTokenParsed]);
}

