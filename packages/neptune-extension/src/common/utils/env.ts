
import { PlatformNotebook } from 'types/platform';
import { NotebookDTO } from 'generated/leaderboard-client/src/models';
import {backendClient} from "../api/backend-client";
import {createProjectIdentifier} from "./project";


export async function getActivationCode(apiToken: string, notebook?: NotebookDTO):Promise<string> {
  if (notebook === undefined) {
    return `import os
os.environ['NEPTUNE_API_TOKEN']="${apiToken}"`;
  }

  // todo getProject endpoint has CORS disabled :/
  const project = await backendClient.api.getProject({
    projectIdentifier: notebook.projectId,
  });

  const projectIdentifier = createProjectIdentifier(project.organizationName, project.name);

  return `import os
os.environ['NEPTUNE_API_TOKEN']="${apiToken}"
os.environ['NEPTUNE_PROJECT']="${projectIdentifier}"
os.environ['NEPTUNE_NOTEBOOK_ID']="${notebook.id}"
os.environ['NEPTUNE_NOTEBOOK_PATH']="${notebook.path}"`;
}

export async function executeActivationCode(platformNotebook: PlatformNotebook, apiToken: string, notebook?: NotebookDTO) {
  const code = await getActivationCode(apiToken, notebook);

  platformNotebook.executeKernelCode(code);

  console.log('Executed activation code.');
}

