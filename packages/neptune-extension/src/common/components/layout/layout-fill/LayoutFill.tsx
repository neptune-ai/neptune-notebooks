// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';

// Module
import './LayoutFill.less';

interface LayoutFillProps extends React.HTMLAttributes<any> {
  component?: string | React.FC<any> | React.ComponentClass<any>
}

const block = bemBlock('n-layout-fill');

const LayoutFill: React.FC<LayoutFillProps> = ({
  className,
  component = 'div',
  ...props
}) => {
  const ownProps = {
    className: block({
      extra: className,
    }),
  };

  return React.createElement(
    component,
    {...props, ...ownProps},
    null,
  );
};

export default LayoutFill;
