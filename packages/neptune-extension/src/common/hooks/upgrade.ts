import React from 'react';
import {useDispatch, useSelector} from 'react-redux'

import { checkVersion } from 'common/api/version';

import { getConfigurationState } from 'common/state/configuration/selectors';
import {addNotification} from 'common/state/notifications/actions';

declare var NBEXTENSION_VERSION: string

export function createUpgradeHandler() {
  if (PLATFORM !== 'nbextension') {
    return;
  }

  const dispatch = useDispatch();

  const {
    apiTokenParsed,
  } = useSelector(getConfigurationState);

  const [alreadyShown, setAlreadyShown] = React.useState(false);

  React.useEffect(() => {
    if (apiTokenParsed && !alreadyShown) {
      const url = apiTokenParsed.api_address;

      if (url && !url.endsWith('neptune.ml') && !url.endsWith('neptune.ai')) {
        // Disable for on prem installations
        return;
      }

      checkVersion().then(latestVersion => {
        if (NBEXTENSION_VERSION !== latestVersion) {
          console.log(`Latest version is ${latestVersion}, but found ${NBEXTENSION_VERSION}`);

          dispatch(addNotification({
            type: 'upgrade-available',
          }));

          setAlreadyShown(true);
        }
      })
    }

  }, [apiTokenParsed]);
}

