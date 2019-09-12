import React, {ReactElement} from 'react';

interface ToolbarWrapperProps {
  children: ReactElement[]
}

const ToolbarWrapper = ({
  children,
}: ToolbarWrapperProps) => {
  /* We cannot embed button via react, so run custom initialization. */

  const group = React.useRef<HTMLElement[]>();

  if (group.current === undefined) {

    const buttons = React.Children.map(children, (child) => {
      return Jupyter.keyboard_manager.actions.register({
        help: child.props.title,
        icon: child.props.icon === 'neptune' ? 'fa-check' : child.props.icon,
        handler: child.props.onClick,
      });
    });

    const buttonGroup = Jupyter.toolbar.add_buttons_group(buttons);

    group.current = Array.from(
      buttonGroup.find('button')
    ) as any as HTMLElement[];
  }

  return React.Children.map(children, (child, idx) => {
    if (group.current) {
      return React.cloneElement(child, {
        ...child.props,
        target: group.current[idx],
      });
    }
  });
};

export default ToolbarWrapper;
