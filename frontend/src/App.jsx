import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerLayout from './customer/layouts/CustomerLayout';
import AdminLayout from './admin/layouts/AdminLayout';
import Home from './customer/pages/Home';
import Books from './customer/pages/Books';
import BookDetail from './customer/pages/BookDetail';
import Cart from './customer/pages/Cart';
import Login from './customer/pages/Login';
import Register from './customer/pages/Register';
import Account from './customer/pages/Account';
import Dashboard from './admin/pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="account" element={<Account />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;