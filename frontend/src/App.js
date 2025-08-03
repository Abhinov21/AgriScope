import React from "react";
import { HashRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Navbar from "./pages/Navbar"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import Homepage from "./pages/Homepage";
import MonitorField from "./pages/MonitorField";
import RequirementsForm from "./pages/RequirementsForm";
import FieldReports from "./pages/FieldReports";
import "./styles/theme.css";
import AboutUs from "./pages/AboutUs";
import CropSuggestion from "./pages/CropSuggestion";


const Layout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>  
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect "/" to "/login" */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/monitor-field" element={<MonitorField />} />
        <Route path="/requirements" element={<RequirementsForm />} />
        <Route path="/field-reports" element={<FieldReports />} />
        <Route path="/crop-suggestion" element={<CropSuggestion />}/>
        {/* Catch-all route for 404 pages */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL || ''}>
      <Layout />
    </Router>
  );
}

export default App;