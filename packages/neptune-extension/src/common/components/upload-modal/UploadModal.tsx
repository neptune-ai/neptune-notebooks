import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from "redux-thunk";

import { bemBlock} from "common/utils/bem";
import { NotebookDTO } from 'generated/leaderboard-client/src/models';

import {
  PlatformNotebook,
} from 'types/platform';

import { PROJECT_LOCAL_STORAGE_KEY } from 'common/utils/localStorage';

import {
  uploadNotebook,
  uploadCheckpoint,
} from 'common/state/notebook/actions';

import * as Layout from 'common/components/layout';
import Modal from 'common/components/modal/Modal';
import ProjectInput from 'common/components/input/ProjectInput';
import Input from 'common/components/input/Input';
import Button from 'common/components/button/Button';
import ButtonWithLoading from 'common/components/button-with-loading/ButtonWithLoading';
import ValidationIcon from "common/components/validation-icon/ValidationIcon";
import ValidationWrapper from "common/components/validation-wrapper/ValidationWrapper";
import Warning from "common/components/warning/Warning";

import { getConfigurationState } from 'common/state/configuration/selectors';
import {
  getNotebookState,
  getNotebookLoadingState,
} from 'common/state/notebook/selectors'

import './UploadModal.less';

interface UploadModalProps {
  platformNotebook: PlatformNotebook
  onClose: () => void
}

type UploadMode = 'notebook' | 'checkpoint'

const block = bemBlock('upload-modal');

const UploadModal: React.FC<UploadModalProps> = ({
  platformNotebook,
  onClose,
}) => {
  const metadata = React.useMemo(() => platformNotebook.getMetadata(), []);

  const dispatch = useDispatch();
  const thunkDispatch = dispatch as ThunkDispatch<{}, {}, AnyAction>;
  const { notebook } = useSelector(getNotebookState)
  const loading = useSelector(getNotebookLoadingState)
  const { inferredUsername } = useSelector(getConfigurationState)

  /*
   * Notebook id was set but cannot by find on the remote. Possible explanations:
   * 1. Api token changed
   * 2. Notebook deleted or access revoked
   */
  const noAccess = !notebook && metadata.notebookId

  // User from the api token is differed that the of remote notebook.
  const ownerChanged = notebook && notebook.owner !== inferredUsername

  // Current notebook was renamed but old path is stored in remote.
  const pathChanged = notebook && notebook.path !== metadata.path

  /*
   * Notebook exists and we have access to upload new checkpoint.
   * Note: even if the path changed, we still can upload.
   */
  const canUploadCheckpoint = notebook && !ownerChanged

  // By default always try to create new checkpoint
  const [ mode, setMode ] = React.useState<UploadMode>(canUploadCheckpoint ? 'checkpoint' : 'notebook');

  const [ projectId, setProjectId ] = React.useState(() => {
    return !!notebook
      ? notebook.projectId
      : window.localStorage.getItem(PROJECT_LOCAL_STORAGE_KEY) || ''
  });
  const [ name, setName ] = React.useState('');
  const [ description, setDescription ] = React.useState('');

  function changeMode(newMode: UploadMode) {
    if (newMode === 'checkpoint') {
      setProjectId((notebook as NotebookDTO).projectId);
    }

    setMode(newMode);
  }

  async function handleSubmit() {
    if (!projectId) {
      return;
    }
    const content = await platformNotebook.saveWorkingCopyAndGetContent();

    const checkpointMeta = {
      path: metadata.path,
      name,
      description,
    };

    if (mode === 'notebook' || metadata.notebookId === undefined) {
     await thunkDispatch(uploadNotebook(projectId, checkpointMeta, content, platformNotebook));
    } else {
      await thunkDispatch(uploadCheckpoint(metadata.notebookId, checkpointMeta, content));
    }
    onClose();
  }

  const disabled = !projectId;

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <Layout.Column className={block()} spacedChildren>
        <h1 className={block('header')}>
          {
            canUploadCheckpoint
              ? 'Upload checkpoint to Neptune'
              : 'Link new notebook to Neptune'
          }
        </h1>

        { noAccess && (
          <Warning>
            You have no access to this notebook.
            A copy of this notebook will be created with current checkpoint as the first one.
          </Warning>
        )}

        { ownerChanged && (
          <Warning>
            You are not an owner of this notebook.
            A copy of this notebook will be created with current checkpoint as the first one.
          </Warning>
        )}

        { pathChanged && (
          <Warning>
            The path of this notebook changed.
            A copy of this notebook will be created with current checkpoint as the first one.
          </Warning>
        )}

        { canUploadCheckpoint && (
          <Layout.Column
            spacedChildren="xs"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {changeMode(event.target.value as UploadMode)}}
          >
            <div>
              <label>
                <Layout.Row
                  span="auto"
                  spacedChildren="sm"
                  alignItems="center"
                >
                <input
                  className={block('radio')}
                  type="radio"
                  value="notebook"
                  checked={mode === 'notebook'}
                />
                  <span>Create new notebook in neptune</span>
                </Layout.Row>
              </label>
            </div>
            <div>
              <label>
                <Layout.Row
                  span="auto"
                  spacedChildren="sm"
                  alignItems="center"
                >
                  <input
                    className={block('radio')}
                    type="radio"
                    value="checkpoint"
                    checked={mode === 'checkpoint'}
                   />
                  <span>Upload a checkpoint to current notebook</span>
                </Layout.Row>
              </label>
            </div>
          </Layout.Column>
        )}


        <Layout.Column spacedChildren="xs">
          <span>Project</span>
          <ProjectInput
            className={block('input')}
            value={projectId}
            disabled={mode === 'checkpoint'}
            onChange={setProjectId}
          />
        </Layout.Column>


        <Layout.Column spacedChildren="xs">
          <span>Notebook name</span>
          <ValidationWrapper>
            <Input
              className={block('input')}
              value={metadata.path}
              disabled
            />
              <ValidationIcon />
          </ValidationWrapper>
        </Layout.Column>


        <Layout.Column spacedChildren="xs">
          <span>Checkpoint name (optional)</span>
          <ValidationWrapper>
            <Input
              className={block('input')}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <ValidationIcon />
          </ValidationWrapper>
        </Layout.Column>

        <Layout.Column spacedChildren="xs">
          <span>Checkpoint description (optional)</span>
          <ValidationWrapper>
            <Input
              className={block('input')}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <ValidationIcon />
          </ValidationWrapper>
        </Layout.Column>

        <Layout.Row
          span="auto"
          justifyContent="end"
          spacedChildren
          withGutter="xl"
        >
          <Button
            variant="secondary"
            disabled={loading}
            children="Cancel"
            onClick={onClose}
          />

          <ButtonWithLoading
            loading={loading}
            disabled={disabled || loading}
            children={mode === 'notebook' ? 'Create notebook' : 'Upload checkpoint'}
            onClick={handleSubmit}
          />
        </Layout.Row>
      </Layout.Column>
    </Modal>
  );
}

export default UploadModal;

