export type Notification = {
  id: string
  type: string
  data?: any
}

export function addNotification(payload: Notification) {
  return {
    type: 'NOTIFICATION_ADD',
    payload,
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
