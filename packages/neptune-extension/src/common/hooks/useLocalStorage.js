import React from 'react';

function useLocalStorage(key) {
  const [ value, setLocalValue ] = React.useState(() => window.localStorage.getItem(key));

  const setValue = (value) => {
    window.localStorage.setItem(key, value);
    setLocalValue(value);
  };

  return [ value, setValue ];
}

export default useLocalStorage;

