import React from 'react';

import { leaderboardClient } from 'common/api/leaderboard-client';

import {
  PlatformNotebook,
  NeptuneClientMsg,
} from 'types/platform';
import { logger } from 'common/utils/logger';

const log = logger.extend('neptuneComm');

async function handleCreateCheckpoint(platformNotebook: PlatformNotebook, checkpointId: string) {
  log('handleCreateCheckpoint', platformNotebook, checkpointId);
  const content = await platformNotebook.saveWorkingCopyAndGetContent();
  log('saved checkpoint', content);

  const metadata = platformNotebook.getMetadata();
  await leaderboardClient.getApi(metadata.projectVersion).uploadCheckpointContent({
    id: checkpointId,
    content,
  });

  log('upload checkpoint content success');
}

export function createNeptuneMessageHandler(platformNotebook: PlatformNotebook) {
  React.useEffect(() => {
    log('platformNotebook.registerNeptuneMessageListener');
    platformNotebook.registerNeptuneMessageListener((msg: NeptuneClientMsg) => {
      if (msg.message_type === 'CHECKPOINT_CREATED') {

        log('Handling neptune_comm message', msg);
        handleCreateCheckpoint(platformNotebook, msg.data.checkpoint_id);
      }
    });
  }, [])
}
