export function naturalStringComparator(a = '', b = ''): number {
  const numOrNotNumRe = /(\d+)|(\D+)/g;
  const numRe = /\d+/;

  const newA = (a + '').toLowerCase().match(numOrNotNumRe);
  const newB = (b + '').toLowerCase().match(numOrNotNumRe);

  while (newA && newB && newA.length > 0 && newB.length > 0) {
    let a1 = newA.shift() as string;
    let b1 = newB.shift() as string;
    let isNumA = numRe.test(a1);
    let isNumB = numRe.test(b1);

    if (isNumA || isNumB) {
      if (!isNumA) {
        return 1;
      }

      if (!isNumB) {
        return -1;
      }

      if (a1 != b1) {
        return parseInt(a1) - parseInt(b1) < 0 ? -1 : 1;
      }
    } else if (a1 != b1) {
      return a1 > b1 ? 1 : -1;
    }
  }

  return getLength(newA) - getLength(newB);
}

function getLength(variable: RegExpMatchArray | null) {
  return variable ? variable.length : 0;
}
