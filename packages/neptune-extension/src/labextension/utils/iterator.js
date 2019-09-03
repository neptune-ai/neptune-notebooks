
export function findButtonIdx(panel) {
  // Insert buttons into the toolbar before the first spacer
  let idx = 0;
  let namesIt = panel.toolbar.names();
  let name;

  // noinspection SuspiciousTypeOfGuard
  while ((name = namesIt.next()) && name !== undefined && name != 'spacer') {
    idx++;
  }

  return idx;
}

