import { Route, Routes } from "react-router";
import "./App.css";
import Page404 from "./components/Page404/Page404";
import { Provider } from "react-redux";
import { store } from "./store";
import Header from "./components/Header/Header";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import UserList from "./components/UserComponents/UserList/UserList";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <Header />
          
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="*" element={<Page404 />} />
            <Route path="/clients" element={<UserList />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

export default App;