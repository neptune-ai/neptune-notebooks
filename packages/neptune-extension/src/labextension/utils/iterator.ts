import { NotebookPanel } from "@jupyterlab/notebook";

export function findButtonIdx(panel: NotebookPanel): number {
  // Insert buttons into the toolbar before the first spacer
  let idx = 0;
  let namesIt = panel.toolbar.names();
  let name;

  // noinspection SuspiciousTypeOfGuard
  while ((name = namesIt.next()) && name != 'spacer') {
    idx++;
  }

  return idx;
}

