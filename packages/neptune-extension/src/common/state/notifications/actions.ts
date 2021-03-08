import { uniqueId } from 'lodash';
import {CheckpointPathArgs} from 'common/utils/createCheckpointUrl';

interface BaseNotification<T> {
  type: T
}

interface NotificationWithData<T, D> extends BaseNotification<T> {
  data: D
}

export type SuccessNotification = NotificationWithData<'success', string>
export type ErrorNotification = NotificationWithData<'error', string>
export type CheckpointSuccessful = NotificationWithData<
  'checkpoint-successful', CheckpointPathArgs & {projectVersion: number | undefined}
>
export type UpgradeAvailable = BaseNotification<'upgrade-available'>

export type Notification = SuccessNotification | ErrorNotification| CheckpointSuccessful | UpgradeAvailable
export type NotificationPayload = { id: string } & Notification;

export function addNotification(payload: Notification) {
  const payloadBody: NotificationPayload = {
    id: uniqueId('notification-'),
    ...payload,
  };

  return {
    type: 'NOTIFICATION_ADD',
    payload: payloadBody,
  } as const;
}

export function removeNotification(id: string) {
  return {
    type: 'NOTIFICATION_REMOVE',
    payload: {
      id
    },
  } as const;
}

export type NotificationsActions = ReturnType<typeof addNotification | typeof removeNotification>
