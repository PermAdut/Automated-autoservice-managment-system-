export enum ActionTypes{
    FETCH_USERS = "FETCH_USERS",
    FETCH_USERS_SUCCESS = "FETCH_USERS_SUCCESS",
    FETCH_USERS_ERROR = "FETCH_USERS_ERROR",
}

export interface UserState {
  users: unknown[];
  loading: boolean;
  error: null | string;
}

export interface FetchUsersAction {
    type: ActionTypes.FETCH_USERS,
}

export interface FetchUsersActionSuccess {
    type: ActionTypes.FETCH_USERS_SUCCESS,
    payload: string[],
}

export interface FetchUsersActionError {
    type: ActionTypes.FETCH_USERS_ERROR,
    payload:string
}

export type UserAction = FetchUsersAction | FetchUsersActionError | FetchUsersActionSuccess
