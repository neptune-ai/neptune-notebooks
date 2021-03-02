import {
  Configuration,
  DefaultApi,
  ListProjectsRequest,
  ProjectListDTO,
} from 'generated/backend-client/src';

export * from 'generated/backend-client/src/apis';
export * from 'generated/backend-client/src/models';

import { getBasePath } from "./auth";
import { updateTokenMiddleware } from "./update-token-middleware";

class BackendApi extends DefaultApi {
  async listProjectsForMemberOrHigher({ userRelation, ...restFilters }: ListProjectsRequest): Promise<ProjectListDTO> {

    return this.listProjects({
      userRelation: 'memberOrHigher',
      ...restFilters,
    });
  }
}

class ApiWrapper {
  protected client: BackendApi

  constructor() {
    this.client = this.createClient(getBasePath());
  }

  createClient(basePath: string) {
    return new BackendApi(new Configuration({
      basePath,
      middleware: [
        updateTokenMiddleware,
      ]
    }));
  }

  get api () {
    return this.client;
  }

  setBasePath(path: string) {
    // reinitialize client as there is no way to override base path after it was created
    this.client = this.createClient(path)
  }
}

export const backendClient = new ApiWrapper();
