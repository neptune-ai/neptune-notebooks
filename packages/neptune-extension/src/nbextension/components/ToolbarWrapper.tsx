import React, {ReactElement} from 'react';

interface ToolbarWrapperProps {
  children: ReactElement[]
}

interface ToolbarWrapperRef {
  targets: ChildNode[],
  handlers: NbActionFunction[],
}

const ToolbarWrapper = ({
  children,
}: ToolbarWrapperProps) => {
  /* We cannot embed button via react, so run custom initialization. */

  const ref = React.useRef<ToolbarWrapperRef>();

  if (ref.current === undefined) {
    const actions : string[] = [];

    ref.current = {
      targets: [],
      handlers: [],
    }

    React.Children.forEach(children, ({ props }, idx) => {
      const current = ref.current as ToolbarWrapperRef;

      const action = Jupyter.keyboard_manager.actions.register({
        help: props.title,
        icon: props.icon === 'neptune' ? 'fa-check' : props.icon,
        handler: () => {
          /* Make sure we call the latest onClick. */
          current.handlers[idx]();
        },
      }, props.label);

      actions.push(action);
      current.handlers.push(props.onClick);
    });

    const buttonGroup = Jupyter.toolbar.add_buttons_group(actions);
    const childNodes = buttonGroup[0].querySelectorAll('button');

    ref.current.targets.push(...Array.from(childNodes));
  }
  else {
    ref.current.handlers = React.Children.map(children, ({ props }) => props.onClick);
  }

  return React.Children.map(children, (child, idx) => {
    if (ref.current) {
      return React.cloneElement(child, {
        ...child.props,
        target: ref.current.targets[idx],
      });
    }
  });
};

export default ToolbarWrapper;
