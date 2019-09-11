import React from 'react';

import './ToolbarWrapper.less';

const ToolbarWrapper: React.FC = ({
  children,
}) => {


  return (
    <div className="toolbar-wrapper">
      { children }
    </div>
  );
};

export default ToolbarWrapper;

