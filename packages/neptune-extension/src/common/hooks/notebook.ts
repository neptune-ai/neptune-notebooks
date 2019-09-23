import React from 'react'
import { useDispatch } from 'react-redux'

import { PlatformNotebook } from 'types/platform'
import { fetchNotebook } from "common/state/notebook/actions";

export function loadInitialNotebook(platformNotebook: PlatformNotebook) {

  const dispatch = useDispatch()

  React.useEffect(() => {
    const metadata = platformNotebook.getMetadata();
    if (metadata.notebookId) {
      dispatch(fetchNotebook(metadata.notebookId))
    }
  }, [])
}

