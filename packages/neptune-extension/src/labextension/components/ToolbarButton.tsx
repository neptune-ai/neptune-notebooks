import React from 'react';
import { ToolbarButtonComponent } from '@jupyterlab/apputils';
import { bemBlock } from 'common/utils/bem';

import { ToolbarButtonProps } from "types/common-ui";

import './ToolbarButton.less';
const block = bemBlock('n-toolbar-button');

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  compact,
  icon,
  label,
  title,
  onClick,
}) => {
  const extra = icon !== 'neptune' ? `fa ${icon}` : undefined;
  return (
    <ToolbarButtonComponent
      className={block({
        modifiers: {
          logo: icon === 'neptune',
        },
      })}
      label={compact ? '' : label}
      tooltip={title}
      iconClass={block({element: 'icon', extra})}
      onClick={onClick}
    />
  );
};

export default ToolbarButton;

