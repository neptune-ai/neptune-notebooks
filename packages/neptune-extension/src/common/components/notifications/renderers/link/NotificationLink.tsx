// Libs
import React from 'react';
import {bemBlock} from 'common/utils/bem';

// Module
import './link.less';
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>

const block = bemBlock('neptune-link');
export const NotificationLink:React.FC<LinkProps> = (props) => {

  return (
    <a className={block()} {...props} />
  );
};
