import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import Modal from 'common/components/modal/Modal';
import Input from 'common/components/input/Input';
import {getConfigurationState} from 'common/state/configuration/selectors';
import {setApiToken} from 'common/state/configuration/actions';
import {authClient} from 'common/api/auth';

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

  const {
    apiToken: localApiToken,
    apiTokenValid: isLocalApiTokenValid,
    setApiToken: setLocalApiToken,
  } = useLocalApiToken(apiToken, isApiTokenValid);

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
        disabled={localApiToken === undefined || isLocalApiTokenValid !== true}
        onClick={handleConnect}
      />
    </Modal>
  );
};

function useLocalApiToken(initialApiToken: string | undefined, initialApiTokenValid: boolean | undefined) {
  const [ apiToken, setApiToken ] = React.useState(initialApiToken);
  const [ apiTokenValid, setValid ] = React.useState(initialApiTokenValid);

  React.useEffect(() => {
    let canValidate = true;

    // don't validate if user didn't provide any value
    if (apiToken !== undefined) {
      setValid(undefined);

      authClient
        .validateToken(apiToken)
        .then(() => canValidate && setValid(true))
        .catch(() => canValidate && setValid(false));
    }

    return () => {
      canValidate = false;
    }
  }, [apiToken]);

  return {
    apiToken,
    apiTokenValid,
    setApiToken,
  }
}
