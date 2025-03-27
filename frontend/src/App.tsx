import { Route, Routes } from "react-router";
import "./App.css";
import Page404 from "./components/Page404/Page404";
import { Provider } from "react-redux";
import { store } from "./store";
import UserList from "./components/UserList/UserList";

function App() {
  return (
    <Provider store={store}>
      <UserList />
      <Routes>
        <Route path="/" element={<></>}></Route>
        <Route path="*" element={<Page404 />}></Route>
      </Routes>
    </Provider>
  );
}

export default App;
