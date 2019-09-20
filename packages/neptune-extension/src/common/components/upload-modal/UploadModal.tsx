import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from "redux-thunk";

import { NotebookDTO } from 'generated/leaderboard-client/src/models';

import {
  PlatformNotebook,
  PlatformNotebookMetadata,
} from 'types/platform';

import { PROJECT_LOCAL_STORAGE_KEY } from 'common/utils/localStorage';

import Modal from 'common/components/modal/Modal';
import ProjectInput from 'common/components/input/ProjectInput';

import {
  fetchNotebook,
  uploadNotebook,
  uploadCheckpoint,
} from 'common/state/notebook/actions';

import { getConfigurationState } from 'common/state/configuration/selectors';
import {
  getNotebookState,
  getLoadingState,
} from 'common/state/notebook/selectors'

interface UploadModalProps {
  platformNotebook: PlatformNotebook
  onClose: () => void
}

type UploadMode = 'notebook' | 'checkpoint'

const UploadModal: React.FC<UploadModalProps> = ({
  platformNotebook,
  onClose,
}) => {
  const metadata = React.useMemo(() => platformNotebook.getMetadata(), []);

  const dispatch = useDispatch();
  const thunkDispatch = dispatch as ThunkDispatch<{}, {}, AnyAction>;
  const { notebook } = useSelector(getNotebookState)
  const loading = useSelector(getLoadingState)
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
    const content = await platformNotebook.getContent();

    const checkpointMeta = {
      path: metadata.path,
      name,
      description,
    };

    if (mode === 'notebook' || metadata.notebookId === undefined) {
      const notebookMeta = await thunkDispatch(uploadNotebook(projectId, checkpointMeta, content));
      if (notebookMeta) {
        await platformNotebook.saveNotebookId(notebookMeta.id);
        await thunkDispatch(fetchNotebook(notebookMeta.id))
      }
    }
    else {
      await thunkDispatch(uploadCheckpoint(metadata.notebookId, checkpointMeta, content));
      if (pathChanged) {
        await thunkDispatch(fetchNotebook(metadata.notebookId));
      }
    }
    onClose();
  }

  const disabled = !projectId;

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      { noAccess && (
        <span>
          You have no access to this notebook.
          A copy of this notebook will be created with current checkpoint as the first one.
        </span>
      )}

      { ownerChanged && (
        <span>
          You are not an owner of this notebook.
          A copy of this notebook will be created with current checkpoint as the first one.
        </span>
      )}

      { pathChanged && (
        <span>
          The path of this notebook changed.
          A copy of this notebook will be created with current checkpoint as the first one.
        </span>
      )}

      { canUploadCheckpoint && (
        <React.Fragment>
          <a href="#" onClick={() => changeMode('notebook')}>
            Create new notebook in neptune
          </a>
          <a href="#" onClick={() => changeMode('checkpoint')}>
            Upload a checkpoint to current notebook
          </a>
        </React.Fragment>
      )}

      Project
      <ProjectInput
        value={projectId}
        disabled={mode === 'checkpoint'}
        onChange={setProjectId}
      />

      Notebook name
      <input
        value={metadata.path}
        disabled
      />

      Checkpoint name (optional)
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      Checkpoint description (optional)
      <input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      { loading && <span children="Loading" /> }

      <button
        disabled={loading}
        children="Cancel"
        onClick={onClose}
      />

      <button
        disabled={disabled || loading}
        children={mode === 'notebook' ? 'Create notebook' : 'Upload checkpoint'}
        onClick={handleSubmit}
      />
    </Modal>
  );
}

export default UploadModal;

