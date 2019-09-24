import { backendClient } from '../api/backend-client';

export async function fetchProjects() {
  const { entries } = await backendClient.api.listProjectsForMemberOrHigher({});

  return entries.map(entry =>
    [ entry.id, `${entry.organizationName}/${entry.name}` ]
  );
}
