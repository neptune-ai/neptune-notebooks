export interface CheckpointPathArgs {
  projectIdentifier: string
  notebookId: string
  notebookName?: string
  checkpointId?: string
}

interface UrlArgs extends CheckpointPathArgs {
  api_address: string
}

export function createCheckpointPath({
  projectIdentifier,
  notebookId,
  notebookName = '',
  checkpointId,
}: CheckpointPathArgs) {
  const basePath = notebookName
    ? `/${projectIdentifier}/n/${notebookName}-${notebookId}`
    : `/${projectIdentifier}/n/${notebookId}`;

  if (checkpointId) {
    return `${basePath}/${checkpointId}`;
  }

  return basePath;
}

export function createCheckpointUrl(options: UrlArgs):string | undefined {
  if (options.api_address) {
    return `${options.api_address}${createCheckpointPath(options)}`;
  }
}
