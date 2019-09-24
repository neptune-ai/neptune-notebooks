// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';

// Module
import LayoutColumn from '../layout-column/LayoutColumn';
import LayoutGrid from '../layout-grid/LayoutGrid';
import LayoutRow from '../layout-row/LayoutRow';

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
