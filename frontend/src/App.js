import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import MonitorField from "./pages/MonitorField";
function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Define the /login route */}
          <Route path="/login" element={<Login />} />

          {/* Define the /register route */}
          <Route path="/register" element={<Register />} />

          {/* Define the /homepage route */}
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/monitor-field" element={<MonitorField />} />

          {/* Default Route (Redirect to /login if no match) */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
