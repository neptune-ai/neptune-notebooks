// Libs
import React from 'react';
import { useSelector } from 'react-redux'
import {TransitionGroup} from 'react-transition-group';

// App
import { getNotifications } from 'common/state/notifications/selectors';
import NotificationsPortal from 'common/components/notifications/notifications-portal/NotificationsPortal';
import Notification from 'common/components/notifications/notification/Notification';
import {FadeTransition} from 'common/components/animation/FadeTransition';

// Module
const NotificationsContainer: React.FC = () => {
  const notifications = useSelector(getNotifications);

  return (
    <NotificationsPortal>
      <TransitionGroup component={null}>
        {
          notifications.map((notification) => (
            <FadeTransition key={notification.id}>
              <Notification {...notification} />
            </FadeTransition>
          ))
        }
      </TransitionGroup>
    </NotificationsPortal>
  )
};

export default NotificationsContainer;
