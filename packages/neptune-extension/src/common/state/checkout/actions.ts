import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { AnyAction } from 'redux';
import { leaderboardClient } from "common/api/leaderboard-client";
import { PlatformNotebook } from "types/platform";

export const fetchCheckpointContent = (checkpointId: string, platformNotebook: PlatformNotebook): ThunkAction<Promise<any>, {}, {}, CheckoutActions> => {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(fetchCheckpointContentRequest());

    try {
      const content = await leaderboardClient.api.getCheckpointContent({ id: checkpointId });
      await platformNotebook.openNotebookInNewWindow(content);

      dispatch(fetchCheckpointSuccess(content));

      return content;
    } catch (err) {
      dispatch(fetchCheckpointFailed());

      return;
    }
  };
};

function fetchCheckpointContentRequest() {
  return { type: 'CHECKPOINT_CONTENT_FETCH_REQUEST' } as const;
}

function fetchCheckpointSuccess(content: any) {
  return { type: 'CHECKPOINT_CONTENT_FETCH_SUCCESS', payload: {content} } as const;
}

function fetchCheckpointFailed() {
  return { type: 'CHECKPOINT_CONTENT_FETCH_FAILED'} as const;
}

export type CheckoutActions = ReturnType<
  typeof fetchCheckpointContentRequest
  | typeof fetchCheckpointSuccess
  | typeof fetchCheckpointFailed
  >
