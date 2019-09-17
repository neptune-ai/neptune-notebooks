import React from 'react';
import { useSelector } from 'react-redux'

import {
  PlatformNotebook,
} from 'types/platform';

import Button from 'common/components/button/Button';
import Modal from 'common/components/modal/Modal';

import { getConfigurationState } from 'common//state/configuration/selectors';
import { getNotebookState } from 'common/state/notebook/selectors'

import { executeActivationCode } from 'common/utils/env';

interface ActivationModalProps {
  platformNotebook: PlatformNotebook
  onClose: () => void
}

const ActivationModal: React.FC<ActivationModalProps> = ({
  platformNotebook,
  onClose,
}) => {

  const {
    apiToken,
    isApiTokenValid,
  } = useSelector(getConfigurationState);

  const {
    notebook,
  } = useSelector(getNotebookState);

  async function handleSubmit() {
    executeActivationCode(platformNotebook, apiToken as string, notebook);

    onClose();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <span>
        Activate neptune-client configuration
      </span>

      <Button 
        children="Cancel"
        variant="secondary"
        onClick={onClose}
      />

      <Button 
        children="Activate"
        onClick={handleSubmit}
      />
    </Modal>
  );
}

export default ActivationModal;

