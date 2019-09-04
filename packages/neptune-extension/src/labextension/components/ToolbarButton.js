import React from 'react';
import { ToolbarButtonComponent } from '@jupyterlab/apputils';

import './ToolbarButton.less';

import { getIconClassNameArray } from 'common/utils/icon';

const ToolbarButton = ({
  label,
  title,
  icon,
  compact,
  visible = true,
  fetchStatus = 'none',
  onClick,
}) => {

  if (!visible) {
    return null;
  }

  const iconClassName = getIconClassNameArray(icon, fetchStatus).join(' ');

  return (
    <ToolbarButtonComponent
      label={compact ? '' : label}
      tooltip={title}
      iconClassName={iconClassName}
      onClick={onClick}
    />
  );
};

export default ToolbarButton;

