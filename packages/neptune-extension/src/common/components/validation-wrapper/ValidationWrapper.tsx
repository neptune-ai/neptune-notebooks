// Libs
import React from 'react';

// App
import * as Layout from 'common/components/layout';

const ValidationWrapper: React.FC = ({
  children,
}) => {
  return (
    <Layout.Row
      span="auto"
      alignItems="center"
      spacedChildren="sm"
    >
      { children }
    </Layout.Row>
  )
};

export default ValidationWrapper;
