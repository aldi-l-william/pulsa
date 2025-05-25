import { Navigate } from 'react-router';

function ProtectedRoute({ children }: { children:any }) {
  const isAuth = localStorage.getItem('auth') === 'true';
  return isAuth ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
