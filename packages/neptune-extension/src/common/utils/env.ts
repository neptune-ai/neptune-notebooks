import { PlatformNotebook } from 'types/platform';
import { NotebookDTO } from 'generated/leaderboard-client/src/models';
import { createProjectIdentifier } from './project';
import { logger } from './logger';

const log = logger.extend('utils');

export function getActivationCode(apiToken: string, notebook?: NotebookDTO): string {
  if (notebook === undefined) {
    return `import os
os.environ['NEPTUNE_API_TOKEN']="${apiToken}"`;
  }

  const projectIdentifier = createProjectIdentifier(notebook.organizationName, notebook.projectName);

  return `import os
os.environ['NEPTUNE_API_TOKEN']="${apiToken}"
os.environ['NEPTUNE_PROJECT']="${projectIdentifier}"
os.environ['NEPTUNE_NOTEBOOK_ID']="${notebook.id}"
os.environ['NEPTUNE_NOTEBOOK_PATH']="${notebook.path}"`;
}

export async function executeActivationCode(platformNotebook: PlatformNotebook, apiToken: string, notebook?: NotebookDTO) {
  const code = getActivationCode(apiToken, notebook);

  platformNotebook.executeKernelCode(code);

  log(`Executed activation code.\n${code}`);
}

