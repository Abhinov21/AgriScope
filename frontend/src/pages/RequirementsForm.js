import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

import "../styles/requirements.css";

const RequirementsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    budget: "",
    experience: "beginner",
    soilType: "",
    irrigation: "yes",
    cropPreference: "",
    useLastField: false, // Checkbox state
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Form Submitted:", formData);
  navigate("/crop-suggestion", { state: formData });
};


  return (
    <div>
      
      <div className="form-container">
        <h2>Farming Requirements</h2>
        <form onSubmit={handleSubmit}>
          <label>Budget (in USD):</label>
          <input type="number" name="budget" value={formData.budget} onChange={handleChange} required />

          <label>Farming Experience:</label>
          <select name="experience" value={formData.experience} onChange={handleChange}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>

          <label>Soil Type:</label>
          <input type="text" name="soilType" placeholder="E.g., Loamy, Sandy, Clayey" value={formData.soilType} onChange={handleChange} />

          <label>Irrigation Available:</label>
          <select name="irrigation" value={formData.irrigation} onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <label>Preferred Crop (if any):</label>
          <input type="text" name="cropPreference" placeholder="E.g., Wheat, Rice, Corn" value={formData.cropPreference} onChange={handleChange} />

          <label className="checkbox-label">
            <input type="checkbox" name="useLastField" checked={formData.useLastField} onChange={handleChange} />
            Use Last Saved Field?
          </label>

          <button type="submit">Submit</button>
        </form>

        {/* Show "Go to Monitor Field" button if user is Beginner or Intermediate AND hasn't checked "Use Last Saved Field" */}
        {(formData.experience === "beginner" || formData.experience === "intermediate") && !formData.useLastField && (
          <button className="monitor-field-button" onClick={() => navigate("/monitor-field")}>
            plot my field
          </button>
        )}
      </div>
    </div>
  );
};

export default RequirementsForm;
