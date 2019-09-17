
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PlatformNotebook } from 'types/platform'

import { getConfigurationState } from 'common/state/configuration/selectors';
import { setNotebook } from 'common/state/notebook/actions'

import { getNotebook } from 'common/utils/upload'

export function loadInitialNotebook(platformNotebook: PlatformNotebook) {

  const dispatch = useDispatch()

  const { isApiTokenValid } = useSelector(getConfigurationState)

  React.useEffect(() => {
    async function fetchNotebook() {
      const metadata = platformNotebook.getMetadata();

      if (metadata.notebookId) {
        // Load notebook from remote.
        try {
          const notebook = await getNotebook(metadata.notebookId)
          dispatch(setNotebook(notebook))
        } catch(e) {
          // 404 or 403
          dispatch(setNotebook(undefined))
        }
      }
      else {
        dispatch(setNotebook(undefined))
      }
    }

    if (isApiTokenValid) {
      fetchNotebook()
    }
  }, [isApiTokenValid])
}

