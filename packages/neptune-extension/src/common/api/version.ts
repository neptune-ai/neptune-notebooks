
export async function checkVersion() {
  const res = await fetch('https://pypi.org/pypi/neptune-notebooks/json');
  const { releases } = await res.json();

  return Object.keys(releases).sort(sortVersion).pop();
}

function sortVersion(a: string, b: string) {
  var partsA = a.split('.');
  var partsB = b.split('.');
  for (var i = 0; i < 3; i++) {
    var numberA = parseInt(partsA[i], 10);
    var numberB = parseInt(partsB[i], 10);
    if (numberA !== numberB) {
      return numberA - numberB;
    }
  }
  return 0;
}

