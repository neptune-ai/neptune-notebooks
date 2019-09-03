import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import NEPTUNE_LOGO_URL from 'common/assets/neptuneLogo';

const ToolbarButton = ({
  target,
  label,
  icon,
  compact,
  visible = true,
}) => {

  React.useEffect(() => {
    target.style.display = visible ? 'block' : 'none';
  }, [visible]);

  if (icon === 'neptune') {
    React.useEffect(() => {
      target.style.background = `${NEPTUNE_LOGO_URL} 7px 4px no-repeat`;
      target.style.paddingLeft = '20px';

      target.querySelector('i').classList.remove('fa-check');
    }, []);
  }

  if (compact) {
    return null;
  }

  const content = (
    <span> {label}</span>
  );

  /*
   * Render label via portal inside the button.
   * Other props has to be set on target ref.
   */
  return ReactDOM.createPortal(content, target);
}

export default ToolbarButton;

