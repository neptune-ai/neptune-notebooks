import { AppState } from 'common/state/reducers';

export function getNotificationsState(state: AppState) {
  return state.notifications;
}

export function getNotifications(state: AppState) {
  return getNotificationsState(state).entries;
}
