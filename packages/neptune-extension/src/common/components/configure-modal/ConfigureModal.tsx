// Lib
import React from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

// App
import * as Layout from 'common/components/layout';
import Button from 'common/components/button/Button';
import Modal from 'common/components/modal/Modal';
import Input from 'common/components/input/Input';
import ValidationWrapper from "common/components/validation-wrapper/ValidationWrapper";
import ValidationIcon, { StatusValue } from "common/components/validation-icon/ValidationIcon";
import ModalHeader from "common/components/modal/ModalHeader";
import { bemBlock } from "common/utils/bem";
import { getConfigurationState } from 'common/state/configuration/selectors';
import { setApiToken } from 'common/state/configuration/actions';
import { authClient } from 'common/api/auth';

// Module
import './ConfigureModal.less';

interface ConfigureModalProps {
  onClose: () => void
}

const block = bemBlock('configure-modal');

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

  let status: StatusValue | undefined;
  if (isLocalApiTokenValid === true) {
    status = 'success'
  } else if (isLocalApiTokenValid === false) {
    status = 'error'
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <Layout.Column className={block()} spacedChildren>
        <ModalHeader>Configure your connection to Neptune</ModalHeader>
        <Layout.Column>
          <label>
            <Layout.Column spacedChildren="xs">
              <span>API Token</span>
              <ValidationWrapper>
                <Input
                  className={block('input')}
                  error={isLocalApiTokenValid === false}
                  value={localApiToken}
                  onChange={handleApiTokenChange}
                />
                <ValidationIcon status={status} />
              </ValidationWrapper>
            </Layout.Column>
          </label>
        </Layout.Column>
        <Layout.Row
          span="auto"
          justifyContent="end"
          withGutter="xl"
          spacedChildren
        >
          <Button
            variant="secondary"
            children="Cancel"
            onClick={onClose}
          />
          <Button
            children="Connect"
            disabled={localApiToken === undefined || isLocalApiTokenValid !== true}
            onClick={handleConnect}
          />
        </Layout.Row>
      </Layout.Column>
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
