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
  notebookName,
  checkpointId,
}: CheckpointPathArgs) {
  return `/${projectIdentifier}/n/${notebookName}-${notebookId}/${checkpointId}`;
}

export function createCheckpointUrl(options: UrlArgs):string | undefined {
  if (options.api_address) {
    return `${options.api_address}${createCheckpointPath(options)}`;
  }
}
