import { CheckoutActions } from './actions'

interface CheckoutState {
  fetchStatus: 'none' | 'pending' | 'success' | 'failure'
}

const initialState: CheckoutState = {
  fetchStatus: 'none',
};

export function checkoutReducer(state: CheckoutState = initialState, action: CheckoutActions): CheckoutState {

  switch (action.type) {

    case "CHECKPOINT_CONTENT_FETCH_REQUEST": {
      return {
        ...state,
        fetchStatus: 'pending',
      }
    }

    case "CHECKPOINT_CONTENT_FETCH_FAILED" : {
      return {
        ...state,
        fetchStatus: 'failure',
      }
    }

    case "CHECKPOINT_CONTENT_FETCH_SUCCESS": {
      return {
        ...state,
        fetchStatus: 'success',
      };
    }

    default:
      return state;
  }
};
