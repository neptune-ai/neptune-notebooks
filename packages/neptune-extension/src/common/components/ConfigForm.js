import React from 'react';

import Modal from 'platform/components/Modal';
import ProjectInput from './ProjectInput';

const ConfigForm = ({
  initialData,
  onClose,
  onSave,
}) => {

  const [ token, setToken ] = React.useState(initialData.token);
  const [ projectId, setProjectId ] = React.useState(initialData.projectId);

  const handleConfirm = () => {
    onSave({ token, projectId });
    onClose();
  };

  return (
    <Modal>
      <div>
        <div>API token and Project allows you to checkpoint and share your work in Neptune.</div>
        <label>
          API token
          <input
            defaultValue={token}
            className="form-control"
            onChange={(event) => setToken(event.target.value)}
          />
        </label>
        
        { token && (
          <ProjectInput
            token={token}
            value={projectId}
            onChange={setProjectId}
          />
        )}
      </div>

      <div>
        <button
          children="Cancel"
          onClick={onClose}
        />
        <button
          disabled={!projectId}
          children="Create notebook"
          onClick={handleConfirm}
        />
      </div>
    </Modal>
  );
};

export default ConfigForm;

