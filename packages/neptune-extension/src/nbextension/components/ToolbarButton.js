import React from 'react';
import ReactDOM from 'react-dom';
import { bemBlock} from 'src/common/utils/bem';

import './ToolbarButton.less';

const block = bemBlock('toolbar-button');

import { getIconClassNameArray } from 'common/utils/icon';

const ToolbarButton = ({
  target,
  label,
  icon,
  compact,
  visible = true,
  fetchStatus,
}) => {

  React.useEffect(() => {
    target.classList.add(block());
  }, []);

  React.useEffect(() => {
    const visibleClass = block({modifiers: {visible: true}}).split(' ')[1];

    (visible)
        ? target.classList.add( visibleClass )
        : target.classList.remove( visibleClass );

  }, [visible]);

  React.useEffect(() => {
    const iconElement = target.querySelector('i');
    const classNames = getIconClassNameArray(icon, fetchStatus);

    iconElement.classList.add(...classNames);

    return () => {
      iconElement.classList.remove(...classNames);
    };
  }, [fetchStatus]);

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

