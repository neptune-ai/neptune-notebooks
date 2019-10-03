// Lib
import React from 'react';
import { bemBlock } from 'common/utils/bem';

// Module
import './Textarea.less';

interface TextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement>{
  value: string
  className?: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const block = bemBlock('neptune-textarea');

const Textarea: React.FC<TextareaProps> = ({
  value,
  className,
  onChange,
  ...rest
}) => {
  const cssClass = block({
    extra: className,
  });

  return (
    <textarea
      value={value}
      className={cssClass}
      onChange={onChange}
      {...rest}
    />
  );
};

export default Textarea;

