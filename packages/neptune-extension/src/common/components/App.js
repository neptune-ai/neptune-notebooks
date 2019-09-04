import React from 'react';

import ToolbarWrapper from 'platform/components/ToolbarWrapper';
import ToolbarButton from 'platform/components/ToolbarButton';

import {
  getAccessToken,
  createNotebook,
  createCheckpoint,
} from 'common/api/backend';

const App = ({
  platformNotebook,
}) => {

  const [ metadata, setMetadata ] = React.useState(platformNotebook.getMetadata);

  const handleConfigure = () => {
    getAccessToken()
      .then(() => Promise.all([ createNotebook(), platformNotebook.getContent() ]))
      .then(([ { data: neptuneData }, notebookData ]) => {
        createCheckpoint(neptuneData.id, notebookData, metadata.path)
          /* metadata changed... */
          .then(() => platformNotebook.saveNotebookId(neptuneData.id))
          .then(() => setMetadata(platformNotebook.getMetadata()));
      });
  };

  const handleUpload = () => {
    getAccessToken()
      .then(() => platformNotebook.getContent())
      .then((notebookData) => createCheckpoint(metadata.notebookId, notebookData, metadata.path));
  };

  const initialized = !!window.localStorage.getItem('neptune_api_token') && !!metadata.notebookId;

  return (
    <div id="neptune-app">
      <ToolbarWrapper>
        <ToolbarButton
          label={'Configure'}
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

