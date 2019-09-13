import React from 'react';
import ReactModal from 'react-modal';

import usePlatformModal from 'platform/hooks/usePlatformModal';
import './Modal.less';

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  children,
  onClose,
}) => {

  usePlatformModal(isOpen);

  /*
   * Prop "style" allows changing props, by using "className" we have to
   * rewrite the style from scratch.
   */
  return (
    <ReactModal
      isOpen={isOpen}
      children={children}
      onRequestClose={onClose}
      className="neptune-modal"
      style={{ overlay: { zIndex: 1000 } }}
    />
  );
};

export default Modal;

