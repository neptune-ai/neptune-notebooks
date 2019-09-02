import React from 'react';

const ToolbarWrapper = ({
  children,
}) => {
  return (
    <div style={{ display: 'flex' }}>
      { children }
    </div>
  );
};

export default ToolbarWrapper;

