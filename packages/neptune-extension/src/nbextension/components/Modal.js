import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Jupyter from 'base/js/namespace';
import dialog from 'base/js/dialog';

const Modal = ({
  children,
}) => {
  const ref = React.useRef(null);

  if (ref.current === null) {
    ref.current = document.createElement('div');

    const modal = dialog.modal({
      show: false,
      title: 'Configure connection to Neptune',
      notebook: Jupyter.notebook,
      keyboard_manager: Jupyter.notebook.keyboard_manager,
      body: ref.current,
    });

    modal.find('.neptune-popup-closer')
      .prepend(
        $('<i/>')
        .addClass('fa fa-lg'),
      )
      .prop('disabled', true);

    modal.find('.modal-footer').hide();
    modal.modal('show');
  }

  return ReactDOM.createPortal(children, ref.current);
};

export default Modal;

