import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { NotebookDTO } from 'generated/leaderboard-client/src/models';

import {
  PlatformNotebook,
  PlatformNotebookMetadata,
} from 'types/platform';

import {
  uploadNotebook,
  uploadCheckpoint,
  getNotebook,
} from 'common/utils/upload';

import { PROJECT_LOCAL_STORAGE_KEY } from 'common/utils/localStorage';

import Modal from 'common/components/modal/Modal';
import ProjectInput from 'common/components/input/ProjectInput';

import { getConfigurationState } from 'common/state/configuration/selectors';
import { getNotebookState } from 'common/state/notebook/selectors'
import { setNotebook } from 'common/state/notebook/actions'

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

  const dispatch = useDispatch()
  const { notebook } = useSelector(getNotebookState)
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

  const [ loading, setLoading ] = React.useState(false);

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
    setLoading(true);

    const content = await platformNotebook.getContent();

    const checkpointMeta = {
      path: metadata.path,
      name,
      description,
    };

    if (mode === 'notebook' || metadata.notebookId === undefined) {
      const notebookMeta = await uploadNotebook(projectId, checkpointMeta, content);

      await platformNotebook.saveNotebookId(notebookMeta.id);

      const notebook = await getNotebook(notebookMeta.id)
      dispatch(setNotebook(notebook))
    }
    else {
      // notebook id is always defined if we can upload a new checkpoint.
      await uploadCheckpoint(metadata.notebookId, checkpointMeta, content);

      if (pathChanged) {
        // Reload notebook
        const notebook = await getNotebook(metadata.notebookId as string)
        dispatch(setNotebook(notebook))
      }
    }

    setLoading(false);

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

