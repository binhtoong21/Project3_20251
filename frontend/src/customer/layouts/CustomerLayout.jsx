import { Outlet, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../../shared/context/AuthContext';

function CustomerLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a layout-specific spinner
  }

  // Prevent admins from accessing the customer area
  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      <Header />
      <main>
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
}

export default CustomerLayout;