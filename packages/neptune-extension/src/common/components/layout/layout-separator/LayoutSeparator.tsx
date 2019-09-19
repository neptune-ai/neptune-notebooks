// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';


// Module
import './LayoutSeparator.less';

const block = bemBlock('n-layout-separator');

const LayoutSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div className={block({extra: className})} {...props}></div>
  );
};

export default LayoutSeparator;
