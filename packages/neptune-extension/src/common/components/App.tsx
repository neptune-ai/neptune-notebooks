import React from 'react';
import {useDispatch, useSelector} from 'react-redux'

import ToolbarWrapper from 'platform/components/ToolbarWrapper';
import ToolbarButton from 'platform/components/ToolbarButton';
import { PlatformNotebook } from 'types/platform';
import {ConfigureModal} from './configure-modal/ConfigureModal';
import {getConfigurationState} from 'common//state/configuration/selectors';
import {validateApiToken} from 'common/state/configuration/actions';

export interface AppProps {
  platformNotebook: PlatformNotebook
}

const App: React.FC<AppProps> = ({
  platformNotebook,
}) => {
  validateGlobalApiToken();

  const {
    isApiTokenValid,
  } = useSelector(getConfigurationState);

  const [ configureModalOpen, setConfigureModalOpen ] = React.useState(false);

  const handleConfigure = () => setConfigureModalOpen(true);

  const handleUpload = async () => {
    // eslint-disable-next-line no-console
    console.debug('@implement me');
  };

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
          visible={isApiTokenValid}
          onClick={handleUpload}
        />
      </ToolbarWrapper>
      {configureModalOpen && (
        <ConfigureModal
          onClose={() => setConfigureModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

function validateGlobalApiToken() {
  const {
    apiToken,
    apiTokenParsed,
  } = useSelector(getConfigurationState);

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (apiToken !== undefined) {
      dispatch(validateApiToken(apiToken, apiTokenParsed))
    }
  }, [apiToken]);
}

