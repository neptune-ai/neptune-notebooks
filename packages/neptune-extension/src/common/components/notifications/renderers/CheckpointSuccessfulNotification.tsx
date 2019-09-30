// Libs
import React from 'react';
import {useSelector} from "react-redux";

// App
import {CheckpointSuccessful} from 'common/state/notifications/actions';
import Toast from 'common/components/toast/Toast';
import {NotificationLink} from "./link/NotificationLink";
import {createCheckpointUrl} from 'common/utils/createCheckpointUrl';
import {getConfigurationState} from 'common/state/configuration/selectors';

// Module
type Props = CheckpointSuccessful & { onClose: () => void };

export const CheckpointSuccessfulNotification: React.FC<Props> = ({ data, onClose }) => {
  const {
    apiTokenParsed
  } = useSelector(getConfigurationState);

  if (!apiTokenParsed) {
    return null;
  }

  const url = createCheckpointUrl({
    api_address: apiTokenParsed.api_address,
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
