import { Dispatch } from "redux";
import { ActionTypes, UserAction } from "../../types/user";
import axios from "axios";

export const fetchUsers = () => {
    return async (dispatch:Dispatch<UserAction>) => {
        try{
            dispatch({type: ActionTypes.FETCH_USERS});
            const reposnse = await axios.get(`https://jsonplaceholder.typicode.com/users`);
            dispatch({type: ActionTypes.FETCH_USERS_SUCCESS, payload: reposnse.data})
        } catch(e){
            console.log(e);
            dispatch({type: ActionTypes.FETCH_USERS_ERROR, payload: 'Error'})
        }
    }
}