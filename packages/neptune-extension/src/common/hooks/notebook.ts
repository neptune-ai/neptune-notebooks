import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PlatformNotebook } from 'types/platform'
import { fetchNotebook } from "common/state/notebook/actions";
import { getConfigurationState } from 'common/state/configuration/selectors';

export function loadInitialNotebook(platformNotebook: PlatformNotebook) {

  const dispatch = useDispatch();

  const { isApiTokenValid } = useSelector(getConfigurationState);

  React.useEffect(() => {
    const metadata = platformNotebook.getMetadata();
    if (metadata.notebookId && isApiTokenValid) {
      dispatch(fetchNotebook(metadata.notebookId))
    }
  }, [isApiTokenValid])
}

