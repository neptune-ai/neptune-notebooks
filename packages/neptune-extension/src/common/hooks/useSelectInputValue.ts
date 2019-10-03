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
): [string | undefined, string | undefined, SelectInputProps, SelectMetaProps, (text?: string) => string | void]  {

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
      if (!valid) {
        if (newOptions.length) {
          setValue(newOptions[0][0])
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
  const validOption = React.useMemo(() => options.find(([ key ]) => key === value),
    [value, options]);

  const valid = validOption != null;
  const label = validOption && validOption[1];

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

  return [ value, label, inputProps, metaProps, setValue ];
}

