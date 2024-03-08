import { Navigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
