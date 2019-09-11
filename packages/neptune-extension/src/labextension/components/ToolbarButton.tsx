import React from 'react';
import { ToolbarButtonComponent } from '@jupyterlab/apputils';
import { bemBlock } from 'common/utils/bem';

import './ToolbarButton.less';

const block = bemBlock('n-toolbar-button');

interface ToolbarButtonProps {
  compact: boolean
  icon: string // maybe we should specify concrete strings of icons
  label: string
  title: string
  visible: boolean
  onClick: () => void
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  compact,
  icon,
  label,
  title,
  visible = true,
  onClick,
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

