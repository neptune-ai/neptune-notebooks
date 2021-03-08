import {
  backendClient,
  ProjectWithRoleDTO
} from 'common/api/backend-client';
import {leaderboardClient} from 'common/api/leaderboard-client';

import moment from 'moment';
import {createProjectIdentifier} from './project';
import {naturalStringComparator} from './naturalStringComparator';
import {ListNotebooksSortByEnum, ListNotebooksSortDirectionEnum} from 'generated/leaderboard-client/src/apis';

type ProjectOptionsFetchMode = 'readable' | 'writable'

export async function fetchProjectOptions(mode: ProjectOptionsFetchMode): Promise<ProjectWithRoleDTO[]> {
  const { entries } = mode === 'readable'
    ? await backendClient.api.listProjects({
        userRelation: 'any',
        limit: 500,
      })
    : await backendClient.api.listProjectsForMemberOrHigher({ limit: 500 });


  return entries
    .sort((left, right) => {
      const leftIdentifier = createProjectIdentifier(left.organizationName, left.name)
      const rightIdentifier = createProjectIdentifier(right.organizationName, right.name)

      return naturalStringComparator(leftIdentifier, rightIdentifier);
    })
}

export async function fetchNotebookOptions(projectIdentifier?: string, projectVersion?: number) {
  if (projectIdentifier === undefined) {
    return [];
  }

  const { entries } = await leaderboardClient.getApi(projectVersion).listNotebooks({
    projectIdentifier,
    sortBy: ListNotebooksSortByEnum.UpdateTime,
    sortDirection: ListNotebooksSortDirectionEnum.Descending,
  });

  return entries.map(entry =>
    [ entry.id, entry.name ]
  );
}

export async function fetchCheckpointOptions(projectVersion: number | undefined, notebookId?: string) {
  if (notebookId === undefined) {
    return [];
  }

  const { entries } = await leaderboardClient.getApi(projectVersion).listCheckpoints({ notebookId });
  return entries.map(entry =>
    [ entry.id, `${entry.name ? entry.name : '(unnamed)'} - ${moment(entry.creationTime).format('YYYY/MM/DD HH:mm:ss')}` ]
  );
}

