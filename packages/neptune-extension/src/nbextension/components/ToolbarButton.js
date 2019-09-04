import React from 'react';
import ReactDOM from 'react-dom';
import { bemBlock} from 'src/common/utils/bem';

import './ToolbarButton.less';

const block = bemBlock('toolbar-button');

const ToolbarButton = ({
  target,
  label,
  icon,
  compact,
  visible = true,
}) => {

  target.classList.add(block());

  React.useEffect(() => {
    const visibleClass = block({modifiers: {visible: true}}).split(' ')[1];

    (visible)
        ? target.classList.add( visibleClass )
        : target.classList.remove( visibleClass );

  }, [visible]);

  React.useEffect(() => {
    const hasIconClass = block({modifiers: {icon: true}}).split(' ')[1];

    (icon === 'neptune')
        ? target.classList.add( hasIconClass )
        : target.classList.remove( hasIconClass );

  }, [icon]);

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
};

export default ToolbarButton;

