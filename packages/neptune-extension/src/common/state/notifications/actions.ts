export function addNotification(id: string, type: string, data: any) {
  return {
    type: 'NOTIFICATION_ADD',
    payload: {
      id,
      type,
      data,
    },
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
