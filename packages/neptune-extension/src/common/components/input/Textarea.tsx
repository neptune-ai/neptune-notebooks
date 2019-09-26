// Lib
import React from 'react';
import { bemBlock } from 'common/utils/bem';

// Module
import './Textarea.less';

interface TextareaProps {
  value: string
  className?: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const block = bemBlock('neptune-textarea');

const Textarea: React.FC<TextareaProps> = ({
  value,
  className,
  onChange,
}) => {
  const cssClass = block({
    extra: className,
  });

  return (
    <textarea
      value={value}
      className={cssClass}
      onChange={onChange}
    />
  );
};

export default Textarea;

