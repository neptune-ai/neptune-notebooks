import React from 'react';
import Select from './Select';
import ValidationWrapper from "../validation-wrapper/ValidationWrapper";
import ValidationIcon from "../validation-icon/ValidationIcon";

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  status?: 'pending' | 'error' | 'success'
  options: string[][]
}

const SelectInput: React.FC<SelectInputProps> = ({
  value,
  disabled,
  status,
  options,
  onChange,
  ...rest
}) => {

  return (
    <ValidationWrapper>
      <Select
        value={value}
        disabled={disabled || status === 'pending'}
        onChange={onChange}
        {...rest}
      >
        { options.map(([ key, value ]) => (
          <option
            key={key}
            value={key}
            children={value}
          />
        ))}
      </Select>
      <ValidationIcon status={status} />
    </ValidationWrapper>
  );
};

export default SelectInput;

