// Libs
import React from 'react';
import {useSelector} from "react-redux";

// App
import {AppState} from 'common/state/reducers';
import {CheckpointSuccessful} from 'common/state/notifications/actions';
import Toast from 'common/components/toast/Toast';
import {NotificationLink} from './link/NotificationLink';
import {createCheckpointUrl} from 'common/utils/createCheckpointUrl';
import {getApplicationUrl} from 'common/state/configuration/selectors';

// Module
type Props = CheckpointSuccessful & { onClose: () => void };

export const CheckpointSuccessfulNotification: React.FC<Props> = ({ data, onClose }) => {
  const applicationUrl = useSelector((state: AppState) => getApplicationUrl(state, data.projectVersion));
  if (!applicationUrl) {
    return null;
  }

  const url = createCheckpointUrl({
    applicationUrl,
    ...data
  });

  return (
    <Toast
      type="success"
      onClose={onClose}
    >
      Checkpoint successfully uploaded! To see notebook in Neptune, go to <NotificationLink href={url} target="_blank">link</NotificationLink>
    </Toast>
  );
};
