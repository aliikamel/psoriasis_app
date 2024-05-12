import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Patients from "./dermatologist/Patients";
import PatientDetails from "./dermatologist/PatientProfile";
import SimulateModel from "./dermatologist/SimulateModel";
import Dashboard from "./Dashboard";
import Upload from "./dermatologist/Upload";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Navbar from "./Navbar";
import { PrivateRoute } from "./PrivateRoute";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import Error404 from "./errors/404";

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* WRAPPED IN CONTEXT PROVIDER FOR APP */}
        <AuthProvider>
          <Navbar />
          {/* Specifying all app routes */}
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                // PRIVATE ROUTES TO SPECIFY ACCESS CONTROL FOR USER ROLES
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute allowed_roles={["dermatologist"]}>
                  <Patients />
                </PrivateRoute>
              }
            />
            <Route
              path="/simulate-model"
              element={
                <PrivateRoute allowed_roles={["dermatologist"]}>
                  <SimulateModel />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute allowed_roles={["dermatologist"]}>
                  <Upload />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients/:patientId"
              element={
                <PrivateRoute allowed_roles={["dermatologist"]}>
                  <PatientDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute allowed_roles={["dermatologist", "patient"]}>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
