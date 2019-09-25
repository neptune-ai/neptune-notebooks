import {
  Configuration,
  DefaultApi,
  UploadCheckpointContentRequest,
} from 'generated/leaderboard-client/src';
import * as runtime from "generated/leaderboard-client/src/runtime";

import { getBasePath } from "./auth";
import { updateTokenMiddleware } from "./update-token-middleware";

interface UploadCheckpointContentRequestExtended extends UploadCheckpointContentRequest {
  content: any
}

class LeaderboardApi extends DefaultApi {
  /**
   * This method is overridden because notebook content is sent as octet-stream and in such case there is no
   * possibility to specify body of such request in swagger v2.
   * Most of the code is copied from original method. Only Content-Type header and body was added.
   */
  async uploadCheckpointContent(requestParameters: UploadCheckpointContentRequestExtended): Promise<void> {
    if (requestParameters.id === null || requestParameters.id === undefined) {
      throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling uploadCheckpointContent.');
    }

    const queryParameters: runtime.HTTPQuery = {};

    const headerParameters: runtime.HTTPHeaders = {
      'Content-Type': 'application/octet-stream',
    };

    await this.request({
      path: `/api/leaderboard/v1/notebooks/checkpoints/{id}/content`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
      method: 'POST',
      headers: headerParameters,
      query: queryParameters,
      body: requestParameters.content
    });
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
