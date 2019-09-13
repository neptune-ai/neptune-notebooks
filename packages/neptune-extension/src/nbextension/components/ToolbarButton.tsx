import React from 'react';
import ReactDOM from 'react-dom';
import { bemBlock } from 'common/utils/bem';

import { ToolbarButtonProps } from "types/common-ui";
import './ToolbarButton.less';

const block = bemBlock('toolbar-button');

interface NBToolbarButtonProps {
  target?: HTMLButtonElement,
}

const ToolbarButton: React.FC<ToolbarButtonProps & NBToolbarButtonProps> = ({
  target,
  label,
  icon,
  compact,
  visible = true,
}) => {
  if (!target) {
    return null;
  }

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
