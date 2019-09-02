export function toStr(value: number) : string {
  if (value === 1) {
    return '1st';
  }
  if (value === 2) {
    return '2nd';
  }
  return `${value}rd`;
}
