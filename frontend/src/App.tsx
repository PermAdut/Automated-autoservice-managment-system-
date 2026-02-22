import { Route, Routes } from "react-router";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store";
import { TenantProvider } from "./components/TenantProvider/TenantProvider";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

// Pages
import MainPage from "./components/MainPage/MainPage.tsx";
import { About } from "./components/AboutUs/About.tsx";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AuthCallback from "./components/Auth/AuthCallback";
import Profile from "./components/UserComponents/Profile/Profile";
import UserList from "./components/UserComponents/UserList/UserList";
import { DetailedUserComponent } from "./components/UserComponents/UserDetailed/UserDetailed.tsx";
import EmployeeList from "./components/EmployeeComponents/EmployeeList/EmployeeList.tsx";
import OrderList from "./components/OrderComponents/OrderList/OrderList.tsx";
import Storage from "./components/StorageComponents/Storage.tsx";
import SupplierList from "./components/SupplierComponent/SupplierList/SupplierList.tsx";
import ReportGenerator from "./components/Reports/ReportGenerator.tsx";
import Page404 from "./components/Page404/Page404";
import AnalyticsDashboard from "./components/Analytics/AnalyticsDashboard.tsx";
import SetupWizard from "./components/Setup/SetupWizard.tsx";
import OnlineBooking from "./components/Booking/OnlineBooking.tsx";
import TenantSettings from "./components/TenantSettings/TenantSettings.tsx";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <TenantProvider>
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Header />
              <main className="flex-1 px-4 py-8 pb-[100px] max-w-[1400px] w-full mx-auto md:px-2 md:py-4 md:pb-[100px]">
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<MainPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Setup Wizard — admin only */}
                  <Route
                    path="/setup"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <SetupWizard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Online booking — all authenticated */}
                  <Route
                    path="/booking"
                    element={
                      <ProtectedRoute allowedRoles={["customer", "admin", "manager"]}>
                        <OnlineBooking />
                      </ProtectedRoute>
                    }
                  />

                  {/* Tenant settings — admin only */}
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <TenantSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Client + staff */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={["customer", "admin", "manager"]}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={["customer", "admin", "manager"]}>
                        <OrderList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employees"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "manager", "customer"]}>
                        <EmployeeList />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin / Manager */}
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "manager"]}>
                        <AnalyticsDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clients"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "manager"]}>
                        <UserList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user/:userId"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "manager"]}>
                        <DetailedUserComponent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/suppliers"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "manager"]}>
                        <SupplierList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "manager"]}>
                        <Storage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "manager"]}>
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
        </TenantProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
