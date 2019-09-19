// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';

// Module
import LayoutColumn from '../layout-column/LayoutColumn';
import LayoutElement from '../layout-element/LayoutElement';
import LayoutFill from '../layout-fill/LayoutFill';
import LayoutGrid from '../layout-grid/LayoutGrid';
import LayoutRow from '../layout-row/LayoutRow';
import LayoutSeparator from '../layout-separator/LayoutSeparator';

interface LayoutProps extends React.HTMLAttributes<any> {
  className: string
  type: 'column' | 'grid' | 'row'
}
type LayoutNamespace<T> = React.FC<T>;

const block = bemBlock('n-layout');

const Layout: LayoutNamespace<LayoutProps> = ({
  className,
  type = 'column',
  ...props
}) => {
  const ownProps = {
    className: block({extra: className}),
  };

  if (type === 'row') {
    return (<LayoutRow {...props} {...ownProps} />);
  } else if (type === 'grid'){
    return (<LayoutGrid {...props} {...ownProps} />);
  }
  return (<LayoutColumn {...props} {...ownProps} />);
};

export default Layout;
