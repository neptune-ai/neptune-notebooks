// Lib
import React from 'react';
import { bemBlock } from 'common/utils/bem';

// Module
import './Input.less';

interface InputProps {
  className?: string
  disabled?: boolean
  error?: boolean
  selectOnFocus?: boolean
  variant?: 'small' | 'big'
  onFocus?: (ev?: React.FocusEvent<HTMLInputElement>) => void
}

const block = bemBlock('neptune-input');

const Input: React.FC<InputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  disabled,
  error,
  selectOnFocus,
  variant,
  onFocus,
  ...props
}) => {
  const classNames = block({
      modifiers: {
        disabled,
        error,
        big: variant === 'big',
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

function selectInputContent(ev: React.FocusEvent<HTMLInputElement>) {
  ev.target.select();
}

function getOnFocusHandler(onFocus?: (ev: React.FocusEvent<HTMLInputElement>) => void, selectOnFocus?: boolean) {
  if (selectOnFocus) {
    if (onFocus) {
      return (ev: React.FocusEvent<HTMLInputElement>) => {
        selectInputContent(ev);
        return onFocus(ev);
      };
    }
    return selectInputContent;
  }
  return onFocus;
}

export default Input;
