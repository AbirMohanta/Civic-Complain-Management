import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  officerOnly?: boolean;
  workerOnly?: boolean;
}

export default function PrivateRoute({
  children,
  officerOnly,
  workerOnly,
}: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Add role check logic here when implemented
  // For now, we'll just return the children
  return <>{children}</>;
}
