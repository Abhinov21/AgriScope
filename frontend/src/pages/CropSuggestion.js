import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/CropSuggestion.css"; // (optional styling)

const CropSuggestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  if (!formData) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>No input data provided</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const { budget, experience, soilType, irrigation, cropPreference } = formData;

  // Simple hardcoded logic
  let suggestion = "Rice";

  if (soilType.toLowerCase().includes("sandy")) {
    suggestion = irrigation === "yes" ? "Groundnut" : "Pearl Millet";
  } else if (soilType.toLowerCase().includes("clayey")) {
    suggestion = irrigation === "yes" ? "Sugarcane" : "Soybean";
  } else if (soilType.toLowerCase().includes("loamy")) {
    suggestion = irrigation === "yes" ? "Wheat" : "Maize";
  }

  // Budget override (if too low)
  if (parseInt(budget) < 100) {
    suggestion = "Mustard (low investment)";
  }

  // Crop preference override
  if (cropPreference && cropPreference.trim() !== "") {
    suggestion = cropPreference;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Crop Suggestion Based on Your Inputs</h2>
      <p><strong>Recommended Crop:</strong> {suggestion}</p>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate("/monitor-field")}>
          Monitor My Field
        </button>
      </div>
    </div>
  );
};

export default CropSuggestion;
