import { Route, Routes } from "react-router";
import "./App.css";
import Page404 from "./components/Page404/Page404";
import { Provider } from "react-redux";
import { store } from "./store";
import Header from "./components/Header/Header";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import UserList from "./components/UserComponents/UserList/UserList";
import Footer from "./components/Footer/Footer";
import { About } from "./components/AboutUs/About";
import {DetailedUserComponent} from './components/UserComponents/UserDetailed/UserDetailed.tsx'
import EmployeeList from "./components/EmployeeComponents/EmployeeList/EmployeeList.tsx";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <div className="app-container">
            <Header />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<div>Home Page</div>} />
                <Route path="*" element={<Page404 />} />
                <Route path="/clients" element={<UserList />} />
                <Route path="/about" element={<About />}/>
                <Route path="/user/:userId" element={<DetailedUserComponent />} />
                <Route path="/employees" element={<EmployeeList />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  );
}

export default App;