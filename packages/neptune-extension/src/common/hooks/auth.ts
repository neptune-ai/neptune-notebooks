import {useDispatch, useSelector} from 'react-redux';
import React from 'react';

import {getConfigurationState} from 'common/state/configuration/selectors';
import {setApiTokenValid, setTokenUsername} from 'common/state/configuration/actions';
import {authClient} from 'common/api/auth';
import {backendClient} from 'common/api/backend-client';
import {leaderboardClient} from 'common/api/leaderboard-client';

export function validateGlobalApiToken() {
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
          // everything set up properly, lets set all API clients to use proper base bath
          authClient.setBasePath(apiTokenParsed.api_address);
          backendClient.setBasePath(apiTokenParsed.api_address);
          leaderboardClient.setBasePath(apiTokenParsed.api_address);

          /*
           * Hint: The code below will trigger immediate re-render and should
           * only be invoked after clients are set.
           */
          dispatch(setApiTokenValid(true));
          dispatch(setTokenUsername(accessToken.username));
        })
        .catch(() => invalidateToken());
    }
  }, [apiToken]);
}
