
import { backendClient } from 'common/api/backend-client';
import { leaderboardClient } from 'common/api/leaderboard-client';

type ProjectOptionsFetchMode = 'readable' | 'writable'

export async function fetchProjectOptions(mode: ProjectOptionsFetchMode) {
  const { entries } = mode === 'readable' 
    ? await backendClient.api.listProjects({})
    : await backendClient.api.listProjectsForMemberOrHigher({});

  return entries.map(entry =>
    [ entry.id, `${entry.organizationName}/${entry.name}` ]
  );
}

export async function fetchNotebookOptions(projectIdentifier?: string) {
  if (projectIdentifier === undefined) {
    return [];
  }

  const { entries } = await leaderboardClient.api.listNotebooks({ projectIdentifier });
  return entries.map(entry =>
    [ entry.id, entry.name as string ]
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

