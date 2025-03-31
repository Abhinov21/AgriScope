import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; 
import Navbar from "./pages/Navbar";  // Import Navbar
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import MonitorField from "./pages/MonitorField";
import RequirementsForm from "./pages/RequirementsForm"; // Import the new page
import DataAnalysis from "./pages/DataAnalysis";

function App() {
  return (
    <Router>
      <div>
        <Navbar />  {/* Add Navbar to be visible on all pages */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/monitor-field" element={<MonitorField />} />
          <Route path="/requirements" element={<RequirementsForm />} />
          <Route path="/Data-analysis" element={<DataAnalysis />} /> {/* Add this route */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
