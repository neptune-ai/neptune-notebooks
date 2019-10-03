import React from 'react';
import ReactDOM from 'react-dom';

const ToolbarWrapper: React.FC = ({
  children,
}) => {

  const content = (
    <div
      className="btn-group"
      children={children}
    />
  );

  const container = document.querySelector(Jupyter.toolbar.selector);

  return ReactDOM.createPortal(content, container as HTMLElement);
};

export default ToolbarWrapper;
