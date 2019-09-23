import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  PlatformNotebook,
} from 'types/platform';

import { leaderboardClient } from 'common/api/leaderboard-client';

import {
  getDefaultProjectId,
  setDefaultProjectId,
} from 'common/utils/localStorage';

import Button from 'common/components/button/Button';
import Modal from 'common/components/modal/Modal';

import useSelectInputValue from 'common/hooks/useSelectInputValue';
import SelectInput from 'common/components/input/SelectInput';

import { getNotebookState } from 'common/state/notebook/selectors'

import { 
  fetchProjectOptions,
  fetchNotebookOptions,
  fetchCheckpointOptions,
} from 'common/utils/checkout';


interface CheckoutModalProps {
  platformNotebook: PlatformNotebook
  onClose: () => void
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  platformNotebook,
  onClose,
}) => {
  const [ loading, setLoading ] = React.useState(false);

  const { notebook } = useSelector(getNotebookState)
  const initialProjectId = () => notebook ? notebook.projectId : getDefaultProjectId();
  const initialNotebookId = notebook ? notebook.id : undefined;

  const [ projectId, projectInputProps, projectMetaProps ] = useSelectInputValue(
    initialProjectId,
    () => fetchProjectOptions('readable'),
    []
  );

  const [ notebookId, notebookInputProps, notebookMetaProps ] = useSelectInputValue(
    initialNotebookId,
    () => fetchNotebookOptions(projectId),
    [projectId]
  );

  const [ checkpointId, checkpointInputProps, checkpointMetaProps ] = useSelectInputValue(
    undefined,
    () => fetchCheckpointOptions(notebookId),
    [notebookId]
  );

  async function handleSubmit() {
    if (checkpointId === undefined || projectId === undefined) {
      return;
    }

    setLoading(true);

    const content = await leaderboardClient.api.getCheckpointContent({ id: checkpointId })

    setDefaultProjectId(projectId);

    await platformNotebook.openNotebookInNewWindow(content);

    setLoading(false);
    onClose();
  }

  const disabled = !projectMetaProps.valid || !notebookMetaProps.valid || !checkpointMetaProps.valid;

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <SelectInput
        label="Project"
        {...projectInputProps}
        {...projectMetaProps}
      />

      <SelectInput
        label="Notebook"
        {...notebookInputProps}
        {...notebookMetaProps}
      />

      <SelectInput
        label="Checkpoint"
        {...checkpointInputProps}
        {...checkpointMetaProps}
      />

      { loading && <span children="Loading" /> }
      { disabled && <span children="Disabled" /> }

      <Button 
        children="Cancel"
        variant="secondary"
        disabled={loading}
        onClick={onClose}
      />

      <Button 
        children="Checkout"
        disabled={disabled || loading}
        onClick={handleSubmit}
      />
    </Modal>
  );
}

export default CheckoutModal;

