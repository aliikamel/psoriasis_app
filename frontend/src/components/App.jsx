import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HelloWorld from "./HelloWorld";
import Login from "./Login";
import Register from "./Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HelloWorld />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
