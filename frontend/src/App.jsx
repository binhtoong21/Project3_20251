import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerLayout from "./customer/layouts/CustomerLayout";
import AdminLayout from "./admin/layouts/AdminLayout";
import Home from "./customer/pages/Home";
import Books from "./customer/pages/Books";
import BookDetail from "./customer/pages/BookDetail";
import Cart from "./customer/pages/Cart";
import Checkout from "./customer/pages/Checkout";
import Login from "./customer/pages/Login";
import Register from "./customer/pages/Register";
import VerifyEmail from "./customer/pages/VerifyEmail";
import ResendVerificationEmail from "./customer/pages/ResendVerificationEmail";
import ForgotPassword from "./customer/pages/ForgotPassword";
import ResetPassword from "./customer/pages/ResetPassword";
import Account from "./customer/pages/Account";
import OrderDetail from "./customer/pages/OrderDetail";
import Marketplace from "./customer/pages/Marketplace";
import AdminRoute from "./admin/components/AdminRoute";
import Dashboard from "./admin/pages/Dashboard";
import BooksManager from "./admin/pages/BooksManager";
import OrdersManager from "./admin/pages/OrdersManager";
import UsersManager from "./admin/pages/UsersManager";
import UserDetail from "./admin/pages/UserDetail";
import DisputesManager from "./admin/pages/DisputesManager";
import DepositsManager from "./admin/pages/DepositsManager";
import WithdrawalsManager from "./admin/pages/WithdrawalsManager";
import SettingsManager from "./admin/pages/SettingsManager";

import ScrollToTop from "./shared/components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="resend-verification" element={<ResendVerificationEmail />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route
            path="account"
            element={<Navigate to="/account/profile" replace />}
          />
          <Route path="account/:tab" element={<Account />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="books" element={<BooksManager />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="users" element={<UsersManager />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="disputes" element={<DisputesManager />} />
            <Route path="deposits" element={<DepositsManager />} />
            <Route path="withdrawals" element={<WithdrawalsManager />} />
            <Route path="settings" element={<SettingsManager />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

