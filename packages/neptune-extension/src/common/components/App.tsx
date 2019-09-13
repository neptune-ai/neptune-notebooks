import React from 'react';

import ToolbarWrapper from 'platform/components/ToolbarWrapper';
import ToolbarButton from 'platform/components/ToolbarButton';
import { PlatformNotebook } from 'types/platform';

import { leaderboardClient } from 'common/api/leaderboard-client';

interface AppProps {
  platformNotebook: PlatformNotebook
}

const App: React.FC<AppProps> = ({
  platformNotebook,
}) => {
  /* TODO: local storage is only temporary. */
  const projectIdentifier = window.localStorage.getItem('neptune_api_project');

  const [ metadata, setMetadata ] = React.useState(platformNotebook.getMetadata);

  const handleConfigure = async () => {
    if (!projectIdentifier) {
      // todo remove this code when we have it handled in UI
      // eslint-disable-next-line no-console
      console.error('No project identifier in localStorage["neptune_api_project"]');
      return;
    }

    const notebook = await leaderboardClient.api.createNotebook({ projectIdentifier });
    const platformNotebookContent = await platformNotebook.getContent();

    const checkpoint = await leaderboardClient.api.createCheckpoint2({
      notebookId: notebook.id,
      checkpoint: {
        path: metadata.path || '',
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
    const notebookContent = await platformNotebook.getContent();
    const checkpoint = await leaderboardClient.api.createCheckpoint2({
      notebookId: metadata.notebookId || '',
      checkpoint: {
        path: metadata.path || '',
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
    </div>
  );
};

export default App;

