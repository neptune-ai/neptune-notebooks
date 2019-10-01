
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import { PlatformNotebook } from 'types/platform'

import { getConfigurationState } from 'common/state/configuration/selectors';
import { getNotebookState } from 'common/state/notebook/selectors';
import { addNotification } from 'common/state/notifications/actions';

import { executeActivationCode } from 'common/utils/env';

/**
 * This is Tuple type of exact size.
 * It could be defined as Array type in this way
 *  type NotebookDependencies = (string | undefined)[]
 * However it allows you to put any number of such elements into array.
 * We want here to have exact number of elements.
 */
type NotebookDependencies = [ string | undefined, string | undefined, string | undefined, string | undefined ];
export function createActivationHandler(platformNotebook: PlatformNotebook) {
  const dispatch = useDispatch();

  const {
    apiToken,
    isApiTokenValid,
  } = useSelector(getConfigurationState);

  const {
    notebook,
  } = useSelector(getNotebookState);

  let notebookDeps: NotebookDependencies = [undefined, undefined, undefined, undefined];

  if (notebook) {
    notebookDeps = [notebook.id, notebook.path, notebook.organizationName, notebook.projectName]
  }

  // eslint-disable-next-line no-console
  console.debug('notebookDeps', notebookDeps);


  React.useEffect(() => {
    if (apiToken && isApiTokenValid) {
      executeActivationCode(platformNotebook, apiToken, notebook);
      dispatch(addNotification({
        type: "success",
        data: "neptune-client configuration activated successfully",
      }))
    }
  }, [apiToken, isApiTokenValid, ...notebookDeps])
}

