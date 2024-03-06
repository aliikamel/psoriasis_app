import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HelloWorld from "./HelloWorld";
import Login from "./Login";
import Register from "./Register";
import SimulateModel from "./SimulateModel";
import Navbar from "./Navbar";
import { ThemeProvider } from "./ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<HelloWorld />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/simulate-model" element={<SimulateModel />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
