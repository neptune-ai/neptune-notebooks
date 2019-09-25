// Libs
import React from 'react';

// App
import { bemBlock } from 'common/utils/bem';

// Module
import './ModalHeader.less';

const block = bemBlock('neptune-modal-header');

const ModalHeader: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...rest
}) => {
  return (
    <h1
      className={block({extra: className})}
      {...rest}
    />
  )
};
export default ModalHeader;
