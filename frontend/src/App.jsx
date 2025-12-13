import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerLayout from "./customer/layouts/CustomerLayout";
import AdminLayout from "./admin/layouts/AdminLayout";
import Home from "./customer/pages/Home";
import Books from "./customer/pages/Books";
import BookDetail from "./customer/pages/BookDetail";
import Cart from "./customer/pages/Cart";
import Checkout from "./customer/pages/Checkout";
import Login from "./customer/pages/Login";
import Register from "./customer/pages/Register";
import Account from "./customer/pages/Account";
import Dashboard from "./admin/pages/Dashboard";
import AdminRoute from "./admin/components/AdminRoute";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import PublicRoute from "./shared/components/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes for Public and Customer (handled by CustomerLayout) */}
        <Route path="/" element={<CustomerLayout />}>
          {/* Publicly accessible routes */}
          <Route index element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetail />} />

          {/* Routes accessible only to non-logged-in users */}
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Routes accessible only to logged-in customers */}
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} /> {/* Dashboard is now the index route */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
