import React from 'react';
import { ToolbarButtonComponent } from '@jupyterlab/apputils';
import { bemBlock } from 'src/common/utils/bem';

import './ToolbarButton.less';

const block = bemBlock('n-toolbar-button');

const ToolbarButton = ({
  label,
  title,
  icon,
  onClick,
  compact,
  visible = true,
}) => {

  if (!visible) {
    return null;
  }

  return (
    <ToolbarButtonComponent
      className={block({
        modifiers: {
          logo: icon === 'neptune',
        },
      })}
      label={compact ? '' : label}
      tooltip={title}
      iconClassName={icon !== 'neptune' ? `fa ${icon}` : undefined}
      onClick={onClick}
    />
  );
};

export default ToolbarButton;

