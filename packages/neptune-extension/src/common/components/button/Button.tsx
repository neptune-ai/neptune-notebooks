// Libs
import React, { ButtonHTMLAttributes } from 'react';
import { bemBlock } from 'common/utils/bem';

import { getEventHandler, EventHandler } from 'common/utils/events';

// Module
import './Button.less';

const block = bemBlock('n-button');

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
  className?: string
  disabled?: boolean
  pressed?: boolean
  size?: 'medium' | 'large'
  type?: 'button' | 'reset' | 'submit'
  variant?: 'primary' | 'secondary'
  component?: string | React.FC<any> | React.ComponentClass<any>
  onClick?: EventHandler
};

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  disabled = false,
  pressed = false,
  size = 'large',
  type = 'button',
  variant = 'primary',
  component = 'button',
  onClick,
  ...props
}) => {

  const cssClasses = block({
    modifiers: {
      size,
      variant,
      disabled,
      pressed,
    },
    extra: [className, {disabled}],
  });

  const onClickHandler = getEventHandler(onClick);

  return React.createElement(
    component,
    {
      className: cssClasses,
      onClick: onClickHandler,
      disabled,
      type,
      ...props,
    },
    children,
  );
};

export default Button;
