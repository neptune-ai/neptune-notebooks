// Lib
import React from 'react';
import { bemBlock } from 'common/utils/bem';

// Module
import './Input.less';

type FocusHandler = React.FocusEventHandler<HTMLInputElement>

interface InputProps {
  className?: string
  disabled?: boolean
  error?: boolean
  selectOnFocus?: boolean
  onFocus?: FocusHandler
}

const block = bemBlock('neptune-input');

const Input: React.FC<InputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  disabled,
  error,
  selectOnFocus,
  onFocus,
  ...props
}) => {
  const classNames = block({
      modifiers: {
        disabled,
        error,
      },
      extra: className,
    });

  return (
    <input
      {...props}
      className={classNames}
      disabled={disabled}
      onFocus={getOnFocusHandler(onFocus, selectOnFocus)}
    />
  );
};

function getOnFocusHandler(onFocus?: FocusHandler, selectOnFocus?: boolean): FocusHandler {
  return (evt) => {
    if (selectOnFocus) {
      evt.target.select();
    }

    if (onFocus) {
      onFocus(evt);
    }
  };
}

export default Input;
