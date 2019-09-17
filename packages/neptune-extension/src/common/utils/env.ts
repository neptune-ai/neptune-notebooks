
import { PlatformNotebook } from 'types/platform';
import { NotebookDTO } from 'generated/leaderboard-client/src/models';

export function getActivationCode(apiToken: string, projectId?: string, notebookId?: string, notebookPath?: string) {
  if (arguments.length === 1) {
    return `import os
os.environ['NEPTUNE_API_TOKEN']="${apiToken}"`;
  }

  return `import os
os.environ['NEPTUNE_API_TOKEN']="${apiToken}"
os.environ['NEPTUNE_PROJECT']="${projectId}"
os.environ['NEPTUNE_NOTEBOOK_ID']="${notebookId}"
os.environ['NEPTUNE_NOTEBOOK_PATH']="${notebookPath}"`;
}

export function executeActivationCode(platformNotebook: PlatformNotebook, apiToken: string, notebook?: NotebookDTO) {
  const code = notebook !== undefined
    ? getActivationCode(apiToken, notebook.projectId, notebook.id, notebook.path)
    : getActivationCode(apiToken);

  platformNotebook.executeKernelCode(code);

  console.log('Executed activation code.');
}

