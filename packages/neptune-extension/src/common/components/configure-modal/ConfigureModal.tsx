import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {
  Configuration as BackendApiConfiguration,
  DefaultApi as BackendApi
} from 'generated/backend-client/src';

import Modal from 'common/components/modal/Modal';
import Input from 'common/components/input/Input';
import {getConfigurationState} from 'common/state/configuration/selectors';
import {setApiToken} from 'common/state/configuration/actions';
import {parseApiToken} from 'common/api/auth';

interface ConfigureModalProps {
  onClose: () => void
}

export const ConfigureModal:React.FC<ConfigureModalProps> = ({
  onClose,
}) => {
  const {
    apiToken,
    isApiTokenValid,
  } = useSelector(getConfigurationState);

  const [localApiToken, setLocalApiToken] = React.useState<string | undefined>(apiToken);
  const [isLocalApiTokenValid, setLocalApiTokenValid] = React.useState<boolean | undefined>(isApiTokenValid);

  validateLocalApiToken(localApiToken, setLocalApiTokenValid);

  const handleApiTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalApiToken(event.target.value);
  };

  const dispatch = useDispatch();
  const handleConnect = () => {
    dispatch(setApiToken(localApiToken as string));
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <h1>Configure your connection to Neptune</h1>
      <label>
        API Token
        <Input
          error={isLocalApiTokenValid === false}
          value={localApiToken}
          onChange={handleApiTokenChange}
        />
      </label>

      <button
        children="Cancel"
        onClick={onClose}
      />
      <button
        children="Connect"
        disabled={localApiToken === undefined || isLocalApiTokenValid === false}
        onClick={handleConnect}
      />
    </Modal>
  );
};

function validateLocalApiToken(apiToken: string | undefined, setValid: (valid: boolean) => void) {
  React.useEffect(() => {
    // don't validate if user didn't provide any value
    if (apiToken !== undefined) {
      const tokenParsed = parseApiToken(apiToken);

      if (tokenParsed === undefined) {
        setValid(false);
      } else {

        // we need local instance of backend api as we don't know the api address before user provides api token
        const localBackendClient = new BackendApi(new BackendApiConfiguration({
          basePath: tokenParsed.api_address,
        }));

        localBackendClient
          .exchangeApiToken({xNeptuneApiToken: apiToken})
          .then(() => setValid(true))
          .catch(() => setValid(false));
      }
    }
  }, [apiToken]);
}
