// Libs
import React from 'react';
import { useSelector } from 'react-redux'

// App
import { getNotifications } from 'common/state/notifications/selectors';
import NotificationsPortal from 'common/components/notifications/notifications-portal/NotificationsPortal';
import Notification from 'common/components/notifications/notification/Notification';

// Module
const NotificationsContainer: React.FC = () => {
  const notifications = useSelector(getNotifications);

  return (
    <NotificationsPortal>
      {
        notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
          />
        ))
      }
    </NotificationsPortal>
  )
};

export default NotificationsContainer;
