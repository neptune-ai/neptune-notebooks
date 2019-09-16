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

  const [ configureModalOpen, setConfigureModalOpen ] = React.useState(false);
  const [ uploadModalOpen, setUploadModalOpen ] = React.useState(false);

  const handleConfigure = () => setConfigureModalOpen(true);

  const { loaded: notebookLoaded } = useSelector(getNotebookState);

  return (
    <div id="neptune-app">
      <ToolbarWrapper>
        <ToolbarButton
          label="Configure"
          title="Connect to Neptune"
          icon="neptune"
          compact={isApiTokenValid}
          onClick={handleConfigure}
        />
        <ToolbarButton
          label="Upload"
          title="Upload to Neptune"
          icon="fa-cloud-upload"
          visible={isApiTokenValid && notebookLoaded}
          onClick={() => setUploadModalOpen(true)}
        />
      </ToolbarWrapper>
      {configureModalOpen && (
        <ConfigureModal
          onClose={() => setConfigureModalOpen(false)}
        />
      )}

      { uploadModalOpen && (
        <UploadModal
          platformNotebook={platformNotebook}
          onClose={() => setUploadModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
