import {AppState} from "common/state/reducers";

export function getCheckoutState(state: AppState) {
  return state.checkout;
}
