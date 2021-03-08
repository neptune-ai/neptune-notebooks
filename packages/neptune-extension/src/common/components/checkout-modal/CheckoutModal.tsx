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

import { bemBlock } from "common/utils/bem";
import Button from 'common/components/button/Button';
import ButtonWithLoading from 'common/components/button-with-loading/ButtonWithLoading';
import Modal from 'common/components/modal/Modal';
import ModalHeader from "common/components/modal/ModalHeader";

import useSelectInputValue from 'common/hooks/useSelectInputValue';
import SelectInput from 'common/components/input/SelectInput';
import * as Layout from 'common/components/layout';

import { getNotebookState } from 'common/state/notebook/selectors'
import { addNotification } from 'common/state/notifications/actions';

import { findNonExistantPath } from 'common/utils/path';
import { createProjectIdentifier } from 'common/utils/project';

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

  const { notebook } = useSelector(getNotebookState);
  const initialProjectId = () => notebook ? notebook.projectId : getDefaultProjectId();
  const initialNotebookId = notebook ? notebook.id : undefined;

  const [ projectId, selectedProject, projectInputProps, projectMetaProps ] = useSelectInputValue(
    initialProjectId,
    () => fetchProjectOptions('readable'),
    option => option.id,
    []
  );

  // todo upgrade typescript so we can use optional chaining (obj?.smth)
  const selectedProjectVersion: number | undefined = selectedProject && selectedProject.version;

  const [ notebookId, selectedNotebookOption, notebookInputProps, notebookMetaProps ] = useSelectInputValue(
    initialNotebookId,
    () => fetchNotebookOptions(projectId, selectedProjectVersion),
    (option => option[0]),
    [projectId, selectedProjectVersion]
  );

  const [ checkpointId, selectedCheckpointOption, checkpointInputProps, checkpointMetaProps ] = useSelectInputValue(
    undefined,
    () => fetchCheckpointOptions(selectedProject && selectedProject.version, notebookId,),
    (option => option[0]),
    [notebookId, selectedProjectVersion]
  );

  const dispatch = useDispatch();

  async function checkoutNotebook() {
    if (checkpointId === undefined || notebookId === undefined || projectId === undefined || selectedProject === undefined) {
      return;
    }

    const notebook = await leaderboardClient.getApi(selectedProjectVersion).getNotebook({ id: notebookId });
    const content = await leaderboardClient.getApi(selectedProjectVersion).getCheckpointContent({ id: checkpointId });

    setDefaultProjectId(projectId);

    const newPath = await findNonExistantPath(notebook.path, platformNotebook);
    await platformNotebook.saveNotebookAndOpenInNewWindow(newPath, content);
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      await checkoutNotebook();
      onClose();
    }
    catch (e) {
      dispatch(addNotification({
        type: 'error',
        data: 'Error during notebook download.',
      }));

      setLoading(false);
    }
  }

  const disabled = !projectMetaProps.valid || !notebookMetaProps.valid || !checkpointMetaProps.valid;

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <Layout.Column className={block()} spacedChildren>
        <ModalHeader>Select a checkpoint you want to work with</ModalHeader>
        <Layout.Column spacedChildren="sm">
          <span>Project</span>
          <SelectInput
            className={block('input')}
            placeholder="No projects to select"
            getLabel={option => createProjectIdentifier(option.organizationName, option.name)}
            {...projectInputProps}
            {...projectMetaProps}
          />
        </Layout.Column>

        <Layout.Column spacedChildren="sm">
          <span>Notebook</span>
          <SelectInput
            className={block('input')}
            placeholder="No notebooks to select"
            getLabel={option => option[1]}
            {...notebookInputProps}
            {...notebookMetaProps}
          />
        </Layout.Column>

        <Layout.Column spacedChildren="sm">
          <span>Checkpoint</span>
          <SelectInput
            className={block('input')}
            placeholder="No checkpoints to select"
            getLabel={option => option[1]}
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
            children="Download"
            loading={loading}
            disabled={disabled || loading}
            onClick={handleSubmit}
          />
        </Layout.Row>
      </Layout.Column>
    </Modal>
  );
};

export default CheckoutModal;

