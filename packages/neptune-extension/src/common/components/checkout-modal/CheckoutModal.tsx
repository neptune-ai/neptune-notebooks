import React from 'react';
import { useSelector } from 'react-redux';

import {
  PlatformNotebook,
} from 'types/platform';

import { leaderboardClient } from 'common/api/leaderboard-client';

import {
  getDefaultProjectId,
  setDefaultProjectId,
} from 'common/utils/localStorage';

import { bemBlock } from "common/utils/bem";
import Button from 'common/components/button/Button';
import ButtonWithLoading from 'common/components/button-with-loading/ButtonWithLoading';
import Modal from 'common/components/modal/Modal';

import useSelectInputValue from 'common/hooks/useSelectInputValue';
import SelectInput from 'common/components/input/SelectInput';
import * as Layout from 'common/components/layout';

import { getNotebookState } from 'common/state/notebook/selectors'

import {
  fetchProjectOptions,
  fetchNotebookOptions,
  fetchCheckpointOptions,
} from 'common/utils/checkout';

import './CheckoutModal.less';


interface CheckoutModalProps {
  platformNotebook: PlatformNotebook
  onClose: () => void
}

const block = bemBlock('checkout-modal');

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

  const disabled = projectMetaProps.status === 'error' || notebookMetaProps.status === 'error' || checkpointMetaProps.status === 'error';

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <Layout.Column className={block()} spacedChildren>
        <Layout.Column spacedChildren="sm">
          <span>Project</span>
          <SelectInput
            className={block('input')}
            {...projectInputProps}
            {...projectMetaProps}
          />
        </Layout.Column>

        <Layout.Column spacedChildren="sm">
          <span>Notebook</span>
          <SelectInput
            className={block('input')}
            {...notebookInputProps}
            {...notebookMetaProps}
          />
        </Layout.Column>

        <Layout.Column spacedChildren="sm">
          <span>Checkpoint</span>
          <SelectInput
            className={block('input')}
            {...checkpointInputProps}
            {...checkpointMetaProps}
          />
        </Layout.Column>

        <Layout.Row
          justifyContent="end"
          span="auto"
          withGutter="xl"
          spacedChildren
        >
          <Button
            children="Cancel"
            variant="secondary"
            disabled={loading}
            onClick={onClose}
          />
          <ButtonWithLoading
            children="Checkout"
            loading={loading}
            disabled={disabled || loading}
            onClick={handleSubmit}
          />
        </Layout.Row>
      </Layout.Column>
    </Modal>
  );
}

export default CheckoutModal;

