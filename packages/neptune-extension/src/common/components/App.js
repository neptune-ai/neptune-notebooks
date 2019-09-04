import React from 'react';

import ConfigForm from 'common/components/ConfigForm';
import ToolbarWrapper from 'platform/components/ToolbarWrapper';
import ToolbarButton from 'platform/components/ToolbarButton';

import {
  uploadNotebook,
  uploadCheckpoint,
} from 'common/core/notebook';

import { showErrorMessage } from 'platform/utils/modal';

import { validateConfiguration } from 'common/core/configuration';

import useLocalStorage from 'common/hooks/useLocalStorage';

const App = ({
  platformNotebook,
}) => {

  const [ metadata, setMetadata ] = React.useState(platformNotebook.getMetadata);

  const [ token, setToken ] = useLocalStorage('neptune_api_token');
  const [ projectId, setProjectId ] = useLocalStorage('neptune_api_project');

  const [ configOpen, setConfigOpen ] = React.useState(false);
  
  const updateConfig = ({ token, projectId }) => {
    setToken(token);
    setProjectId(projectId);

    platformNotebook.getContent().then(content => {
      uploadNotebook(metadata, token, projectId, content)
        .then((data) => platformNotebook.saveNotebookId(data.id))
        // metadata changed...
        .then(() => setMetadata(platformNotebook.getMetadata()));
        // TODO: implement success msg.
    });
  };

  const handleConfigure = () => {

    validateConfiguration(metadata, token)
      .then(() => {
        // Configuration is ok.
        // TODO: display step 2 modal;
        // TODO: implement success msg.
      })
      .catch(() => {
        // Need to setup.
        setConfigOpen(true);
      });
  };

  const handleUpload = () => {

    platformNotebook.getContent().then(content => {

      uploadCheckpoint(metadata, token, content)
        .then(() => {
          // TODO: Implement success msg.
        })
        .catch((error) => {
          // TODO: Implement error msg.
          showErrorMessage(error);
        });
    });
  };

  const initialized = !!token && !!metadata.notebookId;

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
      { configOpen && (
        <ConfigForm
          metadata={metadata}
          initialData={{ token, projectId }}
          onClose={() => setConfigOpen(false)}
          onSave={updateConfig}
        />
      )}
    </div>
  );
};

export default App;

