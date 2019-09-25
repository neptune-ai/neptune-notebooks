import React from 'react';
import {useSelector} from 'react-redux'

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

import UploadModal from 'common/components/upload-modal/UploadModal';
import CheckoutModal from 'common/components/checkout-modal/CheckoutModal';
import ActivationModal from 'common/components/activation-modal/ActivationModal';

type ModalName = 'configure' | 'upload' | 'checkout' | 'activation' | undefined

export interface AppProps {
  platformNotebook: PlatformNotebook
}

const App: React.FC<AppProps> = ({
  platformNotebook,
}) => {
  // Upload notebook when checkpoint created in neptune-client.
  createNeptuneMessageHandler(platformNotebook);

  validateGlobalApiToken();

  loadInitialNotebook(platformNotebook);

  createActivationHandler(platformNotebook);

  const {
    isApiTokenValid,
  } = useSelector(getConfigurationState);

  const metadata = React.useMemo(() => platformNotebook.getMetadata(), []);

  const [ modalOpen, setModalOpen ] = React.useState<ModalName>();

  const {
    fetchStatus,
    notebook
  } = useSelector(getNotebookState);
  const notebookInitialized = !metadata.notebookId || !!notebook || fetchStatus === 'failure';

  return (
    <div id="neptune-app">
      <ToolbarWrapper>
        <ToolbarButton
          label="Configure"
          title="Connect to Neptune"
          icon="neptune"
          compact={isApiTokenValid}
          onClick={() => setModalOpen('configure')}
        />
        <ToolbarButton
          label="Upload"
          title="Upload to Neptune"
          icon="fa-cloud-upload"
          visible={isApiTokenValid && notebookInitialized}
          onClick={() => setModalOpen('upload')}
        />
        <ToolbarButton
          label="Checkout"
          title="Checkout notebook from Neptune"
          icon="fa-sign-out"
          visible={isApiTokenValid && notebookInitialized}
          onClick={() => setModalOpen('checkout')}
        />
        <ToolbarButton
          label="Activate"
          title="Activate neptune-client configuration"
          visible={isApiTokenValid && !!notebook}
          onClick={() => setModalOpen('activation')}
        />
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
  );
};

export default App;
