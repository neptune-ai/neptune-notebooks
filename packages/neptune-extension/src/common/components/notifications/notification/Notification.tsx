// Libs
import React from 'react';
import {useDispatch} from 'react-redux';

// App
import {
  NotificationPayload,
  removeNotification,
} from 'common/state/notifications/actions';
import Toast from 'common/components/toast/Toast';
import { CheckpointSuccessfulNotification } from 'common/components/notifications/renderers/CheckpointSuccessfulNotification';
import { UpgradeAvailableNotification } from 'common/components/notifications/renderers/UpgradeAvailableNotification';


// Module
const SUCCEED_TIMEOUT_TIME = 10 * 1000;
const Notification: React.FC<NotificationPayload> = (props) => {
  const dispatch = useDispatch();
  const remove = React.useCallback(
    () => dispatch(removeNotification(props.id)),
    [props.id]
  );

  React.useEffect(() => {
    const timeoutId = window.setTimeout(remove, SUCCEED_TIMEOUT_TIME);

    return () => {
      window.clearTimeout(timeoutId);
    }
  }, []);

  switch (props.type) {
    case 'checkpoint-successful': {
      return (
        <CheckpointSuccessfulNotification
          type={props.type}
          data={props.data}
          onClose={remove}
        />
      );
    }

    case 'upgrade-available': {
      return (
        <UpgradeAvailableNotification
          onClose={remove}
        />
      );
    }

    default: {
      return (
        <Toast
          type={props.type}
          onClose={remove}
        >
          {props.data}
        </Toast>
      );
    }
  }
};

export default Notification;
