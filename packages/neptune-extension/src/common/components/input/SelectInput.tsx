import React from 'react';
import Select from './Select';
import ValidationWrapper from "../validation-wrapper/ValidationWrapper";
import ValidationIcon from "../validation-icon/ValidationIcon";

interface SelectInputProps<T> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  valid?: boolean,
  loading?: boolean,
  options: T[]
  getKey: (option: T) => string
  getLabel: (option: T) => string
  placeholder?: string
}

function SelectInput<T>({
  value,
  disabled,
  valid,
  loading,
  options,
  getKey,
  getLabel,
  onChange,
  placeholder,
  ...rest
}: SelectInputProps<T>): React.ReactElement {
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
        ) : options.map((option) => (
          <option
            key={getKey(option)}
            value={getKey(option)}
            children={getLabel(option)}
          />
        ))}
      </Select>
      <ValidationIcon status={status} />
    </ValidationWrapper>
  );
}

export default SelectInput;

