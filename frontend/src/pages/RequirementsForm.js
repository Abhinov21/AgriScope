import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/requirements.css";

const RequirementsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    budget: "",
    experience: "beginner",
    soilType: "",
    irrigation: "yes",
    cropPreference: "",
    useLastField: false,
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
    <div className="requirements-page">
      <div className="requirements-header">
        <h1 className="page-title">🌾 Farming Requirements</h1>
        <p className="page-subtitle">
          Tell us about your farming needs to get personalized crop recommendations
        </p>
      </div>

      <div className="requirements-content">
        <div className="requirements-sidebar">
          <div className="sidebar-section">
            <h3>Why We Need This Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-icon">💰</span>
                <div className="info-text">
                  <h4>Budget Planning</h4>
                  <p>Helps us recommend crops within your investment range</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">👨‍🌾</span>
                <div className="info-text">
                  <h4>Experience Level</h4>
                  <p>Ensures recommendations match your farming expertise</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🌱</span>
                <div className="info-text">
                  <h4>Soil & Environment</h4>
                  <p>Matches crops to your specific field conditions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>What You'll Get</h3>
            <ul className="benefits-list">
              <li>🎯 Personalized crop recommendations</li>
              <li>📊 Compatibility scoring for each crop</li>
              <li>💡 Investment and profitability insights</li>
              <li>📈 Success probability analysis</li>
              <li>🌿 Best practices for your experience level</li>
            </ul>
          </div>
        </div>

        <div className="requirements-main">
          <div className="form-container">
            <h2>Tell Us About Your Farming Plans</h2>
            <p>Please provide the following information to get the best crop recommendations:</p>
            
            <form onSubmit={handleSubmit} className="requirements-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>💰 Budget (₹):</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Enter your investment budget"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>👨‍🌾 Farming Experience:</label>
                  <select name="experience" value={formData.experience} onChange={handleChange}>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (3-7 years)</option>
                    <option value="expert">Expert (8+ years)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>🌱 Soil Type:</label>
                  <input
                    type="text"
                    name="soilType"
                    placeholder="e.g., Sandy, Clayey, Loamy, Black soil"
                    value={formData.soilType}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>💧 Irrigation Available:</label>
                  <select name="irrigation" value={formData.irrigation} onChange={handleChange}>
                    <option value="yes">Yes - I have irrigation facilities</option>
                    <option value="no">No - Rain-fed farming only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>🌾 Crop Preference (Optional):</label>
                  <input
                    type="text"
                    name="cropPreference"
                    placeholder="e.g., Rice, Wheat, Vegetables, Cash crops"
                    value={formData.cropPreference}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="useLastField"
                      checked={formData.useLastField}
                      onChange={handleChange}
                    />
                    <span className="checkbox-text">
                      📊 Use data from my last monitored field for enhanced recommendations
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => navigate(-1)} className="secondary-btn">
                  ← Back
                </button>
                <button type="submit" className="primary-btn">
                  Get Crop Recommendations 🚀
                </button>
              </div>
            </form>

            {/* Show "Go to Monitor Field" button if user is Beginner or Intermediate AND hasn't checked "Use Last Saved Field" */}
            {(formData.experience === "beginner" || formData.experience === "intermediate") && !formData.useLastField && (
              <div className="additional-action">
                <p>New to field monitoring? Start by creating your field:</p>
                <button className="monitor-field-button" onClick={() => navigate("/monitor-field")}>
                  🗺️ Create My First Field
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsForm;
