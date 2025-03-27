import { Route, Routes } from "react-router";
import "./App.css";
import Page404 from "./components/Page404/Page404";

function App() {
  return (
    <>
    <Page404></Page404>
      <Routes>
        <Route path="abc" element={<Page404 />}></Route>
      </Routes>
    </>
  );
}

export default App;
