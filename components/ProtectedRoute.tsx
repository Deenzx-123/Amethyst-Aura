
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
