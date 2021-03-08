import {useDispatch, useSelector} from 'react-redux';
import React from 'react';

import {getConfigurationState} from 'common/state/configuration/selectors';
import {setApiTokenValid, setClientConfig, setTokenUsername} from 'common/state/configuration/actions';
import {authClient} from 'common/api/auth';
import {backendClient} from 'common/api/backend-client';
import {leaderboardClient} from 'common/api/leaderboard-client';
import {addNotification} from 'common/state/notifications/actions';
import { logger } from 'common/utils/logger';

const log = logger.extend('auth');

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

      log('Validating api token', apiToken);

      authClient
        .validateToken(apiToken)
        .then(({
          accessToken,
          apiTokenParsed,
          oldDomainClientConfig,
          newDomainClientConfig,
         }) => {
          log('Api token successfully validated and parsed', apiTokenParsed);

          // everything set up properly, lets set all API clients to use proper base bath
          authClient.setBasePath(apiTokenParsed.api_address);
          backendClient.setBasePath(apiTokenParsed.api_address);
          leaderboardClient.setBasePath(oldDomainClientConfig.apiUrl);
          leaderboardClient.setBasePathAlpha(newDomainClientConfig.apiUrl);

          /*
           * Hint: The code below will trigger immediate re-render and should
           * only be invoked after clients are set.
           */
          dispatch(setApiTokenValid(true));
          dispatch(setTokenUsername(accessToken.username));
          dispatch(setClientConfig({
            newDomain: newDomainClientConfig,
            oldDomain: oldDomainClientConfig,
          }));
          dispatch(addNotification({
            type: 'success',
            data: 'Successfully connected to Neptune!',
          }));
        })
        .catch(() => {
          log('WARN', 'Api token invalid');
          invalidateToken();
        });
    }
  }, [apiToken]);
}
