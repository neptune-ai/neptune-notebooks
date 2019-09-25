import { NotificationsActions } from "./actions";

type Notification = {
  id: string
  type: string
  data?: any
}

interface NotificationsState {
  entries: Notification[]
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
        entries: [...state.entries, payload as Notification],
      }
    }

    case 'NOTIFICATION_REMOVE': {
      return {
        ...state,
        entries: state.entries.filter((entry: Notification) => entry.id !== payload.id),
      }
    }

    default:
      return state;
  }
}
