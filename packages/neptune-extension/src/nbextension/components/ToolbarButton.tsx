import React from 'react';
import { bemBlock } from 'common/utils/bem';

import { ToolbarButtonProps } from "types/common-ui";
import './ToolbarButton.less';

const block = bemBlock('toolbar-button');

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  title,
  icon,
  compact,
  onClick,
}) => {
  const cssClass = block({
    modifiers: { 'icon': icon === 'neptune' },
    extra: "btn btn-default"
  });

  return (
    <button
      title={title}
      className={cssClass}
      onClick={onClick}
    >
      { icon && (
        <i className={`fa ${icon}`} />
      )}
      { !compact && (
        <span
          className={icon ? 'toolbar-btn-label' : ''}
          children={label}
        />
      )}
    </button>
  );
};

export default ToolbarButton;
