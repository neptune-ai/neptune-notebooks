// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';
import * as Layout from 'common/components/layout';

// Module
import './NotificationsPortal.less';


interface NotificationsPortalProps {
  className?: string
}

const block = bemBlock('notifications-portal');

const NotificationsPortal: React.FC<NotificationsPortalProps> = ({
  className,
  children,
}) => {

  return (
    <Layout.Column
      alignItems="end"
      className={block({ extra: className })}
      children={children}
    />
  );
}

export default NotificationsPortal;
