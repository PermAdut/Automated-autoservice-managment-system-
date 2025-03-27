import { FC, useEffect } from "react";
import { useTypeSelector } from "../../hooks/useTypedSelector";
import { useDispatch } from "react-redux";
import { fetchUsers } from "../../store/action-creators/user";

const UserList: FC = () => {
  const {users, error, loading} = useTypeSelector(state => state.user);
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchUsers())
  },[])
  
  return <div>UserList</div>;
};

export default UserList;
