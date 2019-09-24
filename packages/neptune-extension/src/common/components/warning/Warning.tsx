// Lib
import React from 'react';

// App
import * as Layout from 'common/components/layout';
import { bemBlock } from "common/utils/bem";

// Module
import './Warning.less';

interface WarningProps {
  className?: string
}

const block = bemBlock('warning');

const Warning: React.FC<WarningProps> = ({
  className,
  children,
}) => {
  return (
    <Layout.Row
      className={block({ extra: className })}
      span="auto"
      spacedChildren
      withPadding
    >
      <i className={block({element: 'icon', extra: ['fa', 'fa-lg', 'fa-exclamation-triangle']})} />
      {' '}
      <span>{ children }</span>
    </Layout.Row>
  )
};

export default Warning;
