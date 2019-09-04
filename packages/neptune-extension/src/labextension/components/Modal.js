import React from 'react';
import ReactModal from 'react-modal';

const Modal = (props) => {
  return (
    <ReactModal
      {...props}
      isOpen
      style={{ overlay: { zIndex: 1000 } }}
    />
  );
};

export default Modal;

