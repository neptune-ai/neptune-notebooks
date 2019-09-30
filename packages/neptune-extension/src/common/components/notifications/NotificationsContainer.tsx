// Libs
import React from 'react';
import { useDispatch, useSelector } from 'react-redux'

// App
import { getNotifications } from 'common/state/notifications/selectors';
import { removeNotification } from 'common/state/notifications/actions';
import Toast from 'common/components/toast/Toast';
import NotificationsPortal from 'common/components/notifications/notifications-portal/NotificationsPortal';
import {CheckpointSuccessfulNotification} from './renderers/CheckpointSuccessfulNotification';
import {UpgradeAvailableNotification} from './renderers/UpgradeAvailableNotification';

// Module
const NotificationsContainer: React.FC = () => {
  const notifications = useSelector(getNotifications);
  const dispatch = useDispatch();
  const deleteNotification = (id: string) => dispatch(removeNotification(id));

  return (
    <NotificationsPortal>
      {
        notifications.map((notification, key) => {
          if (notification.type === 'checkpoint-successful') {
            return <CheckpointSuccessfulNotification key={key} {...notification} onClose={() => (deleteNotification(notification.id))} />
          } else if (notification.type === 'upgrade-available') {
            return <UpgradeAvailableNotification key={key} />
          }

          else {
            return (
              <Toast
                key={key}
                onClose={() => (deleteNotification(notification.id))}
                type="success"
              >
                {JSON.stringify(notification, null, 2)}
              </Toast>
            )
          }
        })
      }
    </NotificationsPortal>
  )
};

export default NotificationsContainer;
