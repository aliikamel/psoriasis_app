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

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute>
                  <Patients />
                </PrivateRoute>
              }
            />
            <Route
              path="/simulate-model"
              element={
                <PrivateRoute>
                  <SimulateModel />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <Upload />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients/:patientId"
              element={
                <PrivateRoute>
                  <PatientDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
