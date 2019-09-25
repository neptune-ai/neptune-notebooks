import React from 'react';

export type SelectOption = Array<string>

export interface SelectInputProps {
  value: string | undefined
  options: Array<SelectOption>
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export interface SelectMetaProps {
  valid?: boolean
  loading?: boolean
}

export default function useSelectInputValue(
  initialValue: undefined | string | (() => string | undefined),
  fetchFn: () => Promise<Array<SelectOption>>,
  deps: ReadonlyArray<any>,
): [string | undefined, SelectInputProps, SelectMetaProps, (text?: string) => string | void]  {

  const [ value, setValue ] = React.useState(initialValue)
  const [ options, setOptions ] = React.useState<Array<SelectOption>>([]);

  const [ loading, setLoading ] = React.useState(false);

  React.useEffect(() => {
    // Reload options if parent value change.
    setLoading(true);
    setOptions([])

    fetchFn().then(newOptions => {
      setLoading(false);
      setOptions(newOptions)

      const valid = newOptions.some(([ key ]) => key === value);

      // select first value after reload if default does not match or exist.
      if (newOptions.length && !valid) {
        setValue(newOptions[0][0])
      }
    });

    return () => {
      // TODO: cancel fetch
    }
  }, deps);

  // During options reload old value is automatically invalidated.
  const valid = React.useMemo(() => options.some(([ key ]) => key === value),
    [value, options]);

  function onChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setValue(event.target.value);
  }

  const inputProps: SelectInputProps = {
    value,
    options,
    onChange,
  };

  const metaProps: SelectMetaProps = {
    valid,
    loading,
  };

  return [ value, inputProps, metaProps, setValue ];
}

