// Libs
import React from 'react';
import ReactDOM from "react-dom";

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
  const content = (
    <Layout.Column
      alignItems="end"
      className={block({ extra: className })}
      children={children}
    />
  );

  return ReactDOM.createPortal(content, document.body);
}

export default NotificationsPortal;
