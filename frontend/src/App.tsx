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
import Login from "./components/Auth/Login";
import AuthCallback from "./components/Auth/AuthCallback";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

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
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/about" element={<About />}/>
                <Route path="/dashboard" element={<Storage />}/>
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin', 'manager']}>
                      <OrderList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/clients" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <UserList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/user/:userId" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <DetailedUserComponent />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/employees" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <EmployeeList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/suppliers" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <SupplierList />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                      <ReportGenerator />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Page404 />} />
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