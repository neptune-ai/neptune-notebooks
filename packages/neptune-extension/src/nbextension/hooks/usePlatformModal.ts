import React from 'react';
import Jupyter from 'base/js/namespace';

function usePlatformModal(isOpen : boolean) {

  return React.useEffect(() => {
    if (isOpen) {
      Jupyter.keyboard_manager.disable();

      return () => {
        Jupyter.keyboard_manager.enable();
        Jupyter.keyboard_manager.command_mode();
      };
    }
  }, [isOpen]);
}

export default usePlatformModal;

