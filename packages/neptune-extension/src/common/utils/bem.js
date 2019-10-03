// Libs
import {
  isArray,
  isFunction,
  isPlainObject,
  isString,
} from 'lodash';


// Module
export function bemBlock(block) {
  return (options) => {
    if (isString(options)) {
      return bem({block, element: options});
    }

    return bem({block, ...options});
  };
}


function bem({
  block,
  element,
  modifiers,
  extra,
  data,
} = {}) {
  const baseClass = isNonEmptyString(element) ? `${block}__${element}` : block;

  return (
    [baseClass].concat(
      toArray(modifiers, keyValueReducer, data).map((modifier) => {
        if (isArray(modifier)) {
          return `${baseClass}--${modifier.join('-')}`;
        }
        return `${baseClass}--${modifier}`;
      }),
    )
    .concat(toArray(extra, keyReducer, data))
    .join(' ')
  );
}


function toArray(collection, itemReducer, data) {
  if (isNonEmptyString(collection)) {
    return stringToArray(collection);
  } else if (isArray(collection)) {
    return collection.reduce((items, item) => {
      if (isArray(item) || isPlainObject(item)) {
        return items.concat(toArray(item, itemReducer, data));
      }
      const value = evaluate(item, data);
      return value ? items.concat(stringToArray('' + value)) : items;
    }, []);
  } else if (isPlainObject(collection)) {
    return objectToArray(collection, itemReducer, data);
  }
  return [];
}


function objectToArray(object, reducer, data) {
  return Object.entries(object)
    .reduce((items, entry) => {
      return items.concat(reducer(entry, data));
    }, []);
}


function keyReducer([key, value]) {
  const predicate = evaluate(value);
  return predicate ? stringToArray(key) : [];
}


function keyValueReducer([key, value], data) {
  const predicate = evaluate(value, data);
  if (predicate) {
    const keys = stringToArray(key);
    if (isNonEmptyString(predicate)) {
      return keys.map(key => [key, predicate]);
    }
    return keys;
  }
  return [];
}


function stringToArray(str) {
  return str.split(/\s+/g).filter((word) => word.length !== 0);
}


function evaluate(item, data) {
  return isFunction(item) ? item(data) : item;
}

function isNonEmptyString(arg) {
  return isString(arg) && arg !== '';
}
