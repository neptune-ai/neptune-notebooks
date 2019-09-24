import React from 'react';

import {
  PlatformNotebook,
} from 'types/platform';

import Button from 'common/components/button/Button';
import Modal from 'common/components/modal/Modal';

interface CheckoutModalProps {
  platformNotebook: PlatformNotebook
  onClose: () => void
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  platformNotebook,
  onClose,
}) => {

  /*
   * TODO:
   * 1. Implement form fields and checkpoint selection.
   * 2. Implement downloading checkpoint content.
   *
   * For the moment we open current content in new window.
   */

  async function handleSubmit() {
    const content = await platformNotebook.getContent();
    await platformNotebook.openNotebookInNewWindow(content);

    onClose();
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
    >
      <Button 
        children="Cancel"
        variant="secondary"
        onClick={onClose}
      />

      <Button 
        children="Checkout"
        onClick={handleSubmit}
      />
    </Modal>
  );
}

export default CheckoutModal;

