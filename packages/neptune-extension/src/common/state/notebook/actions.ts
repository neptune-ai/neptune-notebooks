
import { NotebookDTO } from 'generated/leaderboard-client/src/models';

export function setNotebook(notebook?: NotebookDTO) {
  return {
    type: 'SET_NOTEBOOK',
    payload: {
      notebook,
    },
  } as const;
}

export type NotebookActions = ReturnType<typeof setNotebook>
