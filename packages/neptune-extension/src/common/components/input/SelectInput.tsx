import React from 'react';

import {
  SelectInputProps,
  SelectMetaProps,
  SelectOption,
} from 'common/hooks/useSelectInputValue';
import { backendClient } from 'common/api/backend-client';

interface SelectInputProps2 {
  label?: string
  disabled?: boolean
}

const SelectInput: React.FC<SelectInputProps & SelectMetaProps & SelectInputProps2> = ({
  value,
  label,
  disabled,
  valid,
  loading,
  options,
  onChange,
}) => {

  return (
    <React.Fragment>
      {label}
      <select
        value={value}
        disabled={disabled || loading}
        onChange={onChange}
      >
        { options.map(([ key, value ]) => (
          <option
            key={key}
            value={key}
            children={value}
          />
        ))}
      </select>
      { loading && (
        <span className="fa fa-spin fa-spinner" />
      )}
    </React.Fragment>
  );
};

export default SelectInput;

