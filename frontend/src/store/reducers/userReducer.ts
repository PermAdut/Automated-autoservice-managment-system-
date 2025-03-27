import { UserState } from "../../types/user";
import { UserAction } from "../../types/user";
import { ActionTypes } from "../../types/user";

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

export const userReducer = (state = initialState, action:UserAction): UserState => {
  switch (action.type) {
    case ActionTypes.FETCH_USERS:
      return { loading: true, error: null, users: [] };
    case ActionTypes.FETCH_USERS_SUCCESS:
      return { loading: false, error: null, users: action.payload};
    case ActionTypes.FETCH_USERS_ERROR:
      return { loading: false, error: action.payload, users: [] };
    default:
      return state;
  }
};
