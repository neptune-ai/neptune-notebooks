import React from 'react';
import { ToolbarButtonComponent } from "@jupyterlab/apputils";

import NEPTUNE_LOGO_URL from 'common/assets/neptuneLogo';

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

  /* TODO: add neptune logo. */
  const style = icon === 'neptune'
    ? { background: `${NEPTUNE_LOGO_URL} 1px 1px no-repeat`, paddingLeft: '18px' }
    : undefined;

  return (
    <ToolbarButtonComponent
      label={compact ? '' : label}
      tooltip={title}
      iconClassName={icon !== 'neptune' ? `fa ${icon}` : undefined}
      onClick={onClick}
    />
  );
}

export default ToolbarButton;

