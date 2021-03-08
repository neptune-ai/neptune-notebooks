import React from 'react';

export type SelectOption = Array<string>

export interface SelectInputProps<T> {
  value: string | undefined
  options: T[]
  getKey: (option: T) => string
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export interface SelectMetaProps {
  valid?: boolean
  loading?: boolean
}

export default function useSelectInputValue<T>(
  initialValue: undefined | string | (() => string | undefined),
  fetchFn: () => Promise<T[]>,
  getKey: (option: T) => string,
  deps: ReadonlyArray<any>,
): [string | undefined, T | undefined, SelectInputProps<T>, SelectMetaProps, (text?: string) => string | void]  {

  const [ value, setValue ] = React.useState<string | undefined>(initialValue)
  const [ options, setOptions ] = React.useState<T[]>([]);

  const [ loading, setLoading ] = React.useState(false);

  React.useEffect(() => {
    // Reload options if parent value change.
    setLoading(true);
    setOptions([])

    fetchFn().then(newOptions => {
      setLoading(false);
      setOptions(newOptions)

      const valid = newOptions.some(option => getKey(option) === value);

      // select first value after reload if default does not match or exist.
      if (!valid) {
        if (newOptions.length) {
          setValue(getKey(newOptions[0]))
        } else {
          setValue(undefined)
        }

      }
    }).catch(() => {
      setLoading(false);
      setValue(undefined);
    });

    return () => {
      // TODO: cancel fetch
    }
  }, deps);

  // During options reload old value is automatically invalidated.
  const validOption = React.useMemo(() => options.find(option => getKey(option) === value),
    [value, options]);

  const valid = validOption != null;

  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setValue(event.target.value);
  }

  const inputProps: SelectInputProps<T> = {
    value,
    options,
    getKey,
    onChange,
  };

  const metaProps: SelectMetaProps = {
    valid,
    loading,
  };

  const selectedOption = options.find(option => getKey(option) === value);

  return [ value, selectedOption, inputProps, metaProps, setValue ];
}

