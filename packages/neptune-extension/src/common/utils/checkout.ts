import {backendClient} from 'common/api/backend-client';
import {leaderboardClient} from 'common/api/leaderboard-client';

import {createProjectIdentifier} from './project';
import {naturalStringComparator} from './naturalStringComparator';
import {ListNotebooksSortByEnum, ListNotebooksSortDirectionEnum} from 'generated/leaderboard-client/src/apis';

type ProjectOptionsFetchMode = 'readable' | 'writable'

export async function fetchProjectOptions(mode: ProjectOptionsFetchMode) {
  const { entries } = mode === 'readable'
    ? await backendClient.api.listProjects({})
    : await backendClient.api.listProjectsForMemberOrHigher({});


  return entries
    .map(entry =>
      [ entry.id, createProjectIdentifier(entry.organizationName, entry.name) ]
    )
    .sort((a, b) => naturalStringComparator(a[1], b[1]));
}

export async function fetchNotebookOptions(projectIdentifier?: string) {
  if (projectIdentifier === undefined) {
    return [];
  }

  const { entries } = await leaderboardClient.api.listNotebooks({
    projectIdentifier,
    sortBy: ListNotebooksSortByEnum.UpdateTime,
    sortDirection: ListNotebooksSortDirectionEnum.Descending,
  });

  return entries.map(entry =>
    [ entry.id, entry.name ]
  );
}

export async function fetchCheckpointOptions(notebookId?: string) {
  if (notebookId === undefined) {
    return [];
  }

  const { entries } = await leaderboardClient.api.listCheckpoints({ notebookId });
  return entries.map(entry =>
    [ entry.id, (new Date(entry.creationTime)).toLocaleDateString() ]
  );
}

