import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import PatientDashboard from "./patient/PatientDashboard";
import DermatologistDashboard from "./dermatologist/DermatologistDashboard";


function Dashboard() {
  const { role } = useAuth();
  switch (role) {
    case "dermatologist":
      return <DermatologistDashboard />;
    case "patient":
      return <PatientDashboard />;
    default:
      <Navigate to="/login" />;
  }
}

export default Dashboard;
