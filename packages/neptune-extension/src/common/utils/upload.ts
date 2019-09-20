
import { leaderboardClient } from 'common/api/leaderboard-client';

interface CheckpointMetadata {
  path: string
  name: string
  description: string
}

export async function uploadCheckpoint(notebookId: string, checkpointMeta: CheckpointMetadata, content: any) {
  const checkpoint = await leaderboardClient.api.createEmptyCheckpoint({
    notebookId,
    checkpoint: checkpointMeta,
  });

  await leaderboardClient.api.uploadCheckpointContent({
    id: checkpoint.id,
    content,
  });
}

export async function uploadNotebook(projectId: string, checkpointMeta: CheckpointMetadata, content: any) {
  const notebook = await leaderboardClient.api.createNotebook({ projectIdentifier: projectId });

  await uploadCheckpoint(notebook.id, checkpointMeta, content);

  return notebook
}

export async function getNotebook(notebookId: string) {
  return await leaderboardClient.api.getNotebook({ id: notebookId })
}

