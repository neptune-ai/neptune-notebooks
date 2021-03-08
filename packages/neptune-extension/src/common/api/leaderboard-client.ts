import {
  Configuration,
  DefaultApi,
  GetCheckpointContentRequest,
  UploadCheckpointContentRequest,
} from 'generated/leaderboard-client/src';
import * as runtime from "generated/leaderboard-client/src/runtime";

export * from 'generated/leaderboard-client/src/apis';
export * from 'generated/leaderboard-client/src/models';

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

  async getCheckpointContent(requestParameters: GetCheckpointContentRequest):Promise<any> {
    if (requestParameters.id === null || requestParameters.id === undefined) {
      throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling getCheckpointContent.');
    }

    const queryParameters: runtime.HTTPQuery = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request({
      path: `/api/leaderboard/v1/notebooks/checkpoints/{id}/content`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
      method: 'GET',
      headers: headerParameters,
      query: queryParameters,
    });

    return await new runtime.JSONApiResponse(response).value();
  }
}

class ApiWrapper {
  protected client: LeaderboardApi
  protected clientAlpha: LeaderboardApi

  constructor() {
    this.client = this.createClient(getBasePath());
    this.clientAlpha = this.createClient(getBasePath());
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

  get alphaApi () {
    return this.clientAlpha;
  }


  /**
   * Warning: only notebooks related API is the same between version 1 and version 2
   * Do not use version 2 for other endpoints (like experiments) until we fully migrate to version 2
   */
  getApi(projectVersion: number | undefined) {
    if (projectVersion === 2) {
      return this.clientAlpha;
    }

    return this.client;
  }

  setBasePath(path: string) {
    // reinitialize client as there is no way to override base path after it was created
    this.client = this.createClient(path)
  }

  setBasePathAlpha(path: string) {
    // reinitialize client as there is no way to override base path after it was created
    this.clientAlpha = this.createClient(path);
  }
}

export const leaderboardClient = new ApiWrapper();
