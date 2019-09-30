
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import { PlatformNotebook } from 'types/platform'

import { getConfigurationState } from 'common/state/configuration/selectors';
import { getNotebookState } from 'common/state/notebook/selectors';
import { addNotification } from 'common/state/notifications/actions';

import { executeActivationCode } from 'common/utils/env';

export function createActivationHandler(platformNotebook: PlatformNotebook) {
  const dispatch = useDispatch();

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
      dispatch(addNotification({
        type: "success",
        data: "neptune-client configuration activated successfully",
      }))
    }
  }, [apiToken, isApiTokenValid, notebook])
}

