import {
  NotificationsActions,
  NotificationPayload,
} from "./actions";

interface NotificationsState {
  entries: NotificationPayload[]
}

const initialState: NotificationsState = {
  entries: []
};

export function notificationsReducer(
  state: NotificationsState = initialState,
  action: NotificationsActions,
): NotificationsState {
  const {
    type,
    payload,
  } = action;

  switch (type) {
    case 'NOTIFICATION_ADD': {
      return {
        ...state,
        entries: [...state.entries, payload as NotificationPayload],
      }
    }

    case 'NOTIFICATION_REMOVE': {
      return {
        ...state,
        entries: state.entries.filter((entry) => entry.id !== payload.id),
      }
    }

    default:
      return state;
  }
}
