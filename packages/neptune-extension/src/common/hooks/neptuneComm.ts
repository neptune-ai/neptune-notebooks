import React from 'react';

import { leaderboardClient } from 'common/api/leaderboard-client';

import {
  PlatformNotebook,
  NeptuneClientMsg,
} from 'types/platform';

async function handleCreateCheckpoint(platformNotebook: PlatformNotebook, checkpointId: string) {
  const content = await platformNotebook.saveWorkingCopyAndGetContent();

  await leaderboardClient.api.uploadCheckpointContent({
    id: checkpointId,
    content,
  });
}

export function createNeptuneMessageHandler(platformNotebook: PlatformNotebook) {
  React.useEffect(() => {
    platformNotebook.registerNeptuneMessageListener((msg: NeptuneClientMsg) => {

      if (msg.message_type === 'CHECKPOINT_CREATED') {
        handleCreateCheckpoint(platformNotebook, msg.data.checkpoint_id);
      }
    });
  }, [])
}
