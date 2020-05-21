import React from 'react';
import {
  useDispatch,
  useSelector
} from 'react-redux'

import ToolbarWrapper from 'platform/components/ToolbarWrapper';
import ToolbarButton from 'platform/components/ToolbarButton';
import { PlatformNotebook } from 'types/platform';
import {ConfigureModal} from './configure-modal/ConfigureModal';
import { createNeptuneMessageHandler } from 'common/hooks/neptuneComm';
import {getConfigurationState} from 'common//state/configuration/selectors';
import {validateGlobalApiToken} from 'common/hooks/auth';

import { NotebookDTO } from 'generated/leaderboard-client/src/models';

import { createActivationHandler } from 'common/hooks/activation';
import { loadInitialNotebook } from 'common/hooks/notebook';
import { getNotebookState } from 'common/state/notebook/selectors'
import { createUpgradeHandler } from 'common/hooks/upgrade';

import UploadModal from 'common/components/upload-modal/UploadModal';
import CheckoutModal from 'common/components/checkout-modal/CheckoutModal';
import ActivationModal from 'common/components/activation-modal/ActivationModal';
import NotificationsContainer from 'common/components/notifications/NotificationsContainer';
import { logger } from 'common/utils/logger';

type ModalName = 'configure' | 'upload' | 'checkout' | 'activation' | undefined

export interface AppProps {
  platformNotebook: PlatformNotebook
}

const log = logger.extend('App');

const App: React.FC<AppProps> = ({
  platformNotebook,
}) => {
  // Upload notebook when checkpoint created in neptune-client.
  createNeptuneMessageHandler(platformNotebook);

  validateGlobalApiToken();

  loadInitialNotebook(platformNotebook);

  createActivationHandler(platformNotebook);

  createUpgradeHandler();

  const metadata = React.useMemo(() => platformNotebook.getMetadata(), []);

  const [ modalOpen, setModalOpen ] = React.useState<ModalName>();

  const {
    apiToken,
    isApiTokenValid,
  } = useSelector(getConfigurationState);

  const {
    fetchStatus,
    notebook
  } = useSelector(getNotebookState);

  const notebookInitialized = !metadata.notebookId || !!notebook || fetchStatus === 'failure';

  /*
   * This should be probably considered in detail and we should have one
   * initialization flow and one flag guarding that flow.
   *
   * 1. no api token - initialization finished, configure button only.
   * 2. api token invalid - same as 1. but requires async check.
   * 3. api token valid & notebook loaded
   */
  const applicationInitialized = apiToken === undefined || isApiTokenValid === false || (isApiTokenValid === true && notebookInitialized);

  log(`notebookInitialized === ${notebookInitialized}`);
  log(`applicationInitialized === ${applicationInitialized}`);

  if (!applicationInitialized) {
    return null;
  }

  return (
    <React.Fragment>
      <div id="neptune-app">
        <ToolbarWrapper>
          <ToolbarButton
            label="Configure"
            title="Connect to Neptune"
            icon="neptune"
            compact={isApiTokenValid}
            onClick={() => setModalOpen('configure')}
          />
          { isApiTokenValid && (
            <ToolbarButton
              label="Upload"
              title="Upload to Neptune"
              icon="fa-cloud-upload"
              onClick={() => setModalOpen('upload')}
            />
          )}
          { isApiTokenValid && (
            <ToolbarButton
              label="Download"
              title="Download notebook from Neptune"
              icon="fa-sign-out"
              onClick={() => setModalOpen('checkout')}
            />
          )}
          { (isApiTokenValid && !!notebook) && (
            <ToolbarButton
              label="Activate"
              title="Activate neptune-client configuration"
              onClick={() => setModalOpen('activation')}
            />
          )}
        </ToolbarWrapper>

        { modalOpen === 'configure' && (
          <ConfigureModal
            onClose={() => setModalOpen(undefined)}
          />
        )}

        { modalOpen === 'upload' && (
          <UploadModal
            platformNotebook={platformNotebook}
            onClose={() => setModalOpen(undefined)}
          />
        )}

        { modalOpen === 'checkout' && (
          <CheckoutModal
            platformNotebook={platformNotebook}
            onClose={() => setModalOpen(undefined)}
          />
        )}

        { modalOpen === 'activation' && (
          <ActivationModal
            platformNotebook={platformNotebook}
            onClose={() => setModalOpen(undefined)}
          />
        )}
      </div>
      <NotificationsContainer />
    </React.Fragment>
  );
};

export default App;
