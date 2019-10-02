import React from 'react';
import Select from './Select';
import ValidationWrapper from "../validation-wrapper/ValidationWrapper";
import ValidationIcon from "../validation-icon/ValidationIcon";

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  valid?: boolean,
  loading?: boolean,
  options: string[][]
  placeholder?: string
}

const SelectInput: React.FC<SelectInputProps> = ({
  value,
  disabled,
  valid,
  loading,
  options,
  onChange,
  placeholder,
  ...rest
}) => {
  const endStatus = valid ? 'success' : 'error';
  const status = loading ? 'pending' : endStatus;
  const isDisabled = disabled || status === 'pending' || options.length === 0;
  const showPlaceholder = placeholder && !loading && options.length === 0;

  return (
    <ValidationWrapper>
      <Select
        value={value}
        disabled={isDisabled}
        onChange={onChange}
        defaultValue=""
        {...rest}
      >
        {showPlaceholder ? (
          <option value="" hidden>{ placeholder }</option>
        ) : options.map(([ key, value ]) => (
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

