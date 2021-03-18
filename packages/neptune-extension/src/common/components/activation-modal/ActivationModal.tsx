import React from 'react';
import {useDispatch, useSelector} from 'react-redux'
import SyntaxHighlighter from 'react-syntax-highlighter';

import { NotebookDTO } from 'generated/leaderboard-client/src/models';

import {
  PlatformNotebook,
} from 'types/platform';

import * as Layout from 'common/components/layout';
import Button from 'common/components/button/Button';
import Modal from 'common/components/modal/Modal';

import { getConfigurationState } from 'common//state/configuration/selectors';
import { getNotebookState } from 'common/state/notebook/selectors'

import {
  getActivationCode,
  executeActivationCode,
} from 'common/utils/env';
import ModalHeader from "../modal/ModalHeader";
import {addNotification} from "common/state/notifications/actions";

interface ActivationModalProps {
  platformNotebook: PlatformNotebook
  onClose: () => void
}

const ActivationModal: React.FC<ActivationModalProps> = ({
  platformNotebook,
  onClose,
}) => {
  const dispatch = useDispatch();

  const {
    apiToken,
  } = useSelector(getConfigurationState);

  const {
    notebook: notebookProp,
  } = useSelector(getNotebookState);

  const notebook = notebookProp as NotebookDTO;

  const code = getActivationCode(apiToken as string, notebook);

  async function handleSubmit() {
    executeActivationCode(platformNotebook, apiToken as string, notebook);
    dispatch(addNotification({
      type: "success",
      data: "neptune-client configuration activated successfully",
    }));

    onClose();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <Layout.Column spacedChildren="lg">
        <ModalHeader>Activate neptune-client configuration</ModalHeader>
        <span>
          Activate configuration to create Neptune runs and see them all linked to this notebook. Click "Activate" to run the code below, then just "import neptune" and work as usual.
        </span>

        <SyntaxHighlighter language="python">
          { code }
        </SyntaxHighlighter>

        <Layout.Row
          span="auto"
          justifyContent="end"
          spacedChildren
        >
          <Button
            children="Cancel"
            variant="secondary"
            onClick={onClose}
          />

          <Button
            children="Activate"
            onClick={handleSubmit}
          />
        </Layout.Row>
      </Layout.Column>
    </Modal>
  );
}

export default ActivationModal;

