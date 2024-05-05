import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Error403 from "./errors/403";

export const PrivateRoute = ({ allowed_roles, children }) => {
  const { isAuthenticated, role } = useAuth();
  return allowed_roles ? (
    isAuthenticated && allowed_roles.includes(role) ? (
      children
    ) : (
      <Error403 />
      // NEED TO SWITCH THIS TO 403 FORBIDDEN
    )
  ) : isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};
