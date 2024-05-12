import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Error403 from "./errors/403";

export const PrivateRoute = ({ allowed_roles, children }) => {
  const { isAuthenticated, role } = useAuth();

  // only render if user role is in allowed_roles prop or is authenticated
  return allowed_roles ? (
    isAuthenticated && allowed_roles.includes(role) ? (
      children
    ) : (
      <Error403 />
    )
  ) : isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};
