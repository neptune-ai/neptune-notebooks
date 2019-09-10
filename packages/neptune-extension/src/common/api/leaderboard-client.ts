import {
  Configuration,
  DefaultApi,
  UploadCheckpointContentRequest,
} from 'generated/leaderboard-client/src';

import { getBasePath } from "./auth";
import { updateTokenMiddleware } from "./update-token-middleware";

interface UploadCheckpointContentRequestExtended extends UploadCheckpointContentRequest{
  content: string
}

class LeaderboardApi extends DefaultApi {
  async uploadCheckpointContent(requestParameters: UploadCheckpointContentRequestExtended): Promise<void> {
    // todo reimplement it using this.request because checkpoint content is not specified in swagger
    // backend guys do the same in neptune-client codebase

    console.error('uploadCheckpointContent not implemented yet', requestParameters);
    return Promise.resolve();
  }
}

class ApiWrapper {
  protected client: LeaderboardApi

  constructor() {
    this.client = this.createClient(getBasePath());
  }

  createClient(basePath: string) {
    return new LeaderboardApi(new Configuration({
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

export const leaderboardClient = new ApiWrapper();
