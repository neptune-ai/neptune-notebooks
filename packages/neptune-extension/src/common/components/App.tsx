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

import { loadInitialNotebook } from 'common/hooks/notebook';
import { getNotebookState } from 'common/state/notebook/selectors'

import UploadModal from 'common/components/upload-modal/UploadModal';
import CheckoutModal from 'common/components/checkout-modal/CheckoutModal';

type ModalName = 'configure' | 'upload' | 'checkout' | 'activate' | undefined

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

  const {
    isApiTokenValid,
  } = useSelector(getConfigurationState);

  const [ modalOpen, setModalOpen ] = React.useState<ModalName>();

  const { loaded: notebookLoaded } = useSelector(getNotebookState);

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
          visible={isApiTokenValid && notebookLoaded}
          onClick={() => setModalOpen('upload')}
        />
        <ToolbarButton
          label="Checkout"
          title="Checkout notebook from Neptune"
          icon="fa-sign-out-alt"
          visible={isApiTokenValid}
          onClick={() => setModalOpen('checkout')}
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
    </div>
  );
};

export default App;
