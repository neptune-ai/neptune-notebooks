
import React from 'react'
import {useSelector} from 'react-redux'

import { PlatformNotebook } from 'types/platform'

import { getConfigurationState } from 'common/state/configuration/selectors';
import { getNotebookState } from 'common/state/notebook/selectors';

import { executeActivationCode } from 'common/utils/env';

export function createActivationHandler(platformNotebook: PlatformNotebook) {
  const {
    apiToken,
    isApiTokenValid,
  } = useSelector(getConfigurationState);

  const {
    notebook,
  } = useSelector(getNotebookState);

  React.useEffect(() => {
    if (apiToken && isApiTokenValid) {
      executeActivationCode(platformNotebook, apiToken, notebook);
    }
  }, [apiToken, isApiTokenValid, notebook])
}

