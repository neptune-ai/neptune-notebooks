// Libs
import React from 'react';

// App
import {bemBlock} from "common/utils/bem";

// Module
import './Em.less';

interface EMProps {
  className?: string
  monospace?: boolean
}

const block = bemBlock('neptune-em');
export const Em:React.FC<EMProps> = ({
  className,
  monospace = false,
  ...props
}) => {
  return (
    <span
      className={block({ extra: className, modifiers: { monospace } })}
      {...props}
    />
  );
};
