// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';
import LayoutRow from 'common/components/layout/layout-row/LayoutRow';

// Module
import './LayoutGrid.less';

type AlignContentValue = 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'stretch'

interface LayoutGridProps extends React.HTMLAttributes<any> {
  alignContent?: AlignContentValue
  className?: string
}

const block = bemBlock('n-layout-grid');

const LayoutGrid: React.FC<LayoutGridProps> = ({
  alignContent = 'stretch',
  className,
  ...props
}) => {
  const ownProps = {
    className: block({
      modifiers: {
        'align-content': alignContent,
      },
      extra: className,
    }),
  };

  return (
    <LayoutRow
      {...props}
      {...ownProps}
    />
  );
};

export default LayoutGrid;
