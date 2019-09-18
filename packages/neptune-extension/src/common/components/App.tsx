import React from 'react';
import {useDispatch, useSelector} from 'react-redux'

import ToolbarWrapper from 'platform/components/ToolbarWrapper';
import ToolbarButton from 'platform/components/ToolbarButton';
import { PlatformNotebook } from 'types/platform';
import {ConfigureModal} from './configure-modal/ConfigureModal';
import {getConfigurationState} from 'common//state/configuration/selectors';
import {setApiTokenValid, setTokenUsername} from 'common/state/configuration/actions';
import {authClient} from "../api/auth";
import {backendClient} from "../api/backend-client";
import {leaderboardClient} from "../api/leaderboard-client";

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
  } = useSelector(getConfigurationState);

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (apiToken !== undefined) {
      function invalidateToken() {
        dispatch(setApiTokenValid(false));
        dispatch(setTokenUsername(undefined));
      }

      authClient
        .validateToken(apiToken)
        .then(({ accessToken, apiTokenParsed }) => {
          dispatch(setApiTokenValid(true));
          dispatch(setTokenUsername(accessToken.username));

          // everything set up properly, lets set all API clients to use proper base bath
          authClient.setBasePath(apiTokenParsed.api_address);
          backendClient.setBasePath(apiTokenParsed.api_address);
          leaderboardClient.setBasePath(apiTokenParsed.api_address);
        })
        .catch(() => invalidateToken());
    }
  }, [apiToken]);
}
