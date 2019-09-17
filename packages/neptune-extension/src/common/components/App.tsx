import React from 'react';
import { Provider } from 'react-redux'

import ToolbarWrapper from 'platform/components/ToolbarWrapper';
import ToolbarButton from 'platform/components/ToolbarButton';
import Input from 'common/components/input/Input';
import { PlatformNotebook } from 'types/platform';
import configure from 'common/state/store';

import { leaderboardClient } from 'common/api/leaderboard-client';

import Modal from 'common/components/Modal';

interface AppProps {
  platformNotebook: PlatformNotebook
}

const store = configure();

const App: React.FC<AppProps> = ({
  platformNotebook,
}) => {
  /* TODO: local storage is only temporary. */
  const projectIdentifier = window.localStorage.getItem('neptune_api_project');

  const [ metadata, setMetadata ] = React.useState(() => platformNotebook.getMetadata());

  const [ open, setOpen ] = React.useState(true);

  const handleConfigure = async () => {
    if (!projectIdentifier) {
      // todo remove this code when we have it handled in UI
      // eslint-disable-next-line no-console
      console.error('No project identifier in localStorage["neptune_api_project"]');
      return;
    }

    const notebook = await leaderboardClient.api.createNotebook({ projectIdentifier });
    const platformNotebookContent = await platformNotebook.getContent();

    const checkpoint = await leaderboardClient.api.createEmptyCheckpoint({
      notebookId: notebook.id,
      checkpoint: {
        path: metadata.path,
        // name, todo handle optional checkpoint name
        // description, // todo handle optional checkpoint description
      },
    });

    await leaderboardClient.api.uploadCheckpointContent({
      id: checkpoint.id,
      content: platformNotebookContent,
    });

    await platformNotebook.saveNotebookId(notebook.id);
    setMetadata(platformNotebook.getMetadata());
  };

  const handleUpload = async () => {
    if (!metadata.notebookId) {
      return;
    }

    const notebookContent = await platformNotebook.getContent();
    const checkpoint = await leaderboardClient.api.createEmptyCheckpoint({
      notebookId: metadata.notebookId,
      checkpoint: {
        path: metadata.path,
        // name, // todo handle optional checkpoint name
        // description, // todo handle optional checkpoint description
      },
    });

    leaderboardClient.api.uploadCheckpointContent({
      id: checkpoint.id,
      content: notebookContent,
    });
  };

  const initialized = !!window.localStorage.getItem('neptune_api_token') && !!metadata.notebookId;

  return (
    <Provider store={store}>
      <div id="neptune-app">
        <ToolbarWrapper>
          <ToolbarButton
            label="Configure"
            title="Connect to Neptune"
            icon="neptune"
            compact={initialized}
            onClick={handleConfigure}
          />
          <ToolbarButton
            label="Upload"
            title="Upload to Neptune"
            icon="fa-cloud-upload"
            visible={initialized}
            onClick={handleUpload}
          />
        </ToolbarWrapper>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
      >
        Welcome to Neptune!
        <Input value="for test only" error />
      </Modal>
      </div>
    </Provider>
  );
};

export default App;

