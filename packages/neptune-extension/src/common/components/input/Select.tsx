// Lib
import React from 'react';

// App
import { bemBlock} from "common/utils/bem";

// Module
import './Select.less';

const block = bemBlock('n-select');

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className,
  disabled,
  ...props
}) => {

  return (
    <select
      className={block({modifiers: {disabled}, extra: className})}
      disabled={disabled}
      {...props}
    />
  )
};

export default Select;



