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
import OrderList from './components/OrderComponents/OrderList/OrderList.tsx'
import Storage from "./components/StorageComponents/Storage.tsx";
import SupplierList from "./components/SupplierComponent/SupplierList/SupplierList.tsx";
import MainPage from "./components/MainPage/MainPage.tsx";
import ReportGenerator from "./components/Reports/ReportGenerator.tsx";
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <div className="app-container">
            <Header />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="*" element={<Page404 />} />
                <Route path="/clients" element={<UserList />} />
                <Route path="/about" element={<About />}/>
                <Route path="/user/:userId" element={<DetailedUserComponent />} />
                <Route path="/employees" element={<EmployeeList />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/dashboard" element={<Storage />}/>
                <Route path="/suppliers" element={<SupplierList />}/>
                <Route path="/reports" element={<ReportGenerator />}/>
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