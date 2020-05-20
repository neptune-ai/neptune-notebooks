import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PlatformNotebook } from 'types/platform'
import { fetchNotebook } from "common/state/notebook/actions";
import { getConfigurationState } from 'common/state/configuration/selectors';
import { logger } from 'common/utils/logger';

const log = logger.extend('hooks');

export function loadInitialNotebook(platformNotebook: PlatformNotebook) {

  const dispatch = useDispatch();

  const { isApiTokenValid } = useSelector(getConfigurationState);

  React.useEffect(() => {
    if (!isApiTokenValid) {
      return
    }

    log('loadInitialNotebook from Neptune API');

    const metadata = platformNotebook.getMetadata();

    if (!metadata.notebookId) {
      log('Nothing to load. Notebook is not known to Neptune.');
      return;
    }

    dispatch(fetchNotebook(metadata.notebookId));
  }, [isApiTokenValid])
}

