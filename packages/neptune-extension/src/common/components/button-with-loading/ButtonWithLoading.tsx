// Libs
import React from 'react';

// App
import Button, { ButtonProps } from 'common/components/button/Button';
import { bemBlock } from 'common/utils/bem';

// Module
import './ButtonWithLoading.less';

interface ButtonWithLoadingProps extends ButtonProps {
  className?: string
  loading?: boolean
  pressed?: boolean
}

const block = bemBlock('button-with-loading');

const ButtonWithLoading: React.FC<ButtonWithLoadingProps> = ({
  children,
  className,
  loading = false,
  pressed,
  ...props
}) => {
  const isPressed = loading || pressed;

  return (
    <Button
      className={block({
        modifiers: {
          loading,
        },
        extra: className,
      })}
      pressed={isPressed}
      {...props}
    >
      {
        loading  && (
          <i className={block({
              element: 'icon',
              extra: ['fa', 'fa-spinner', 'fa-spin'],
            })}
          />
        )
      }
      { children }
    </Button>
  );
};

export default ButtonWithLoading;
