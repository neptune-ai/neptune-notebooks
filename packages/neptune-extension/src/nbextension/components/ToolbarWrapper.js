/* global Jupyter:readonly */

import React from 'react';

const ToolbarWrapper = ({
  children,
}) => {
  /* We cannot embed button via react, so run custom initialization. */

  const group = React.useRef(null);

  if (group.current === null) {

    const buttons = React.Children.map(children, (child) => {
      return Jupyter.keyboard_manager.actions.register({
        help: child.props.title,
        icon: child.props.icon === 'neptune' ? undefined : child.props.icon,
        handler: child.props.onClick,
      });
    });

    const buttonGroup = Jupyter.toolbar.add_buttons_group(buttons);

    group.current = Array.from(buttonGroup.find('button'));
  }

  return React.Children.map(children, (child, idx) => {
    return React.cloneElement(child, {
      ...child.props,
      target: group.current[idx],
    });
  });
};

export default ToolbarWrapper;

