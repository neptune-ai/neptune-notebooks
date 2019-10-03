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

const container = document.createElement('div');

const NotificationsPortal: React.FC<NotificationsPortalProps> = ({
  className,
  children,
}) => {
  React.useEffect(() => {
    document.body.append(container)
  }, []);

  const content = (
    <Layout.Column
      alignItems="end"
      className={block({ extra: className })}
      children={children}
    />
  );

  return ReactDOM.createPortal(content, container);
}

export default NotificationsPortal;
