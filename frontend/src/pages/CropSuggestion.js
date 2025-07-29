import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CropSuggestion.css";

const CropSuggestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldAnalysisData, setFieldAnalysisData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [fields, setFields] = useState([]);
  const [userRequirements, setUserRequirements] = useState({
    budget: '',
    experience: 'beginner',
    soilType: '',
    irrigation: 'yes',
    cropPreference: '',
    useFieldAnalysis: false
  });

  // Enhanced crop database with detailed information
  const cropDatabase = {
    rice: {
      name: "Rice",
      season: "monsoon",
      soilSuitability: ["clayey", "loamy"],
      waterRequirement: "high",
      minBudget: 200,
      experienceLevel: ["beginner", "intermediate", "expert"],
      ndviRange: [0.3, 0.8],
      climateConditions: ["warm", "humid"],
      pros: ["Staple crop with high demand", "Good market stability", "High yield potential"],
      cons: ["High water requirement", "Prone to pest attacks", "Labor intensive"],
      profitability: "medium",
      duration: "120-150 days",
      irrigationNeeded: true
    },
    wheat: {
      name: "Wheat",
      season: "winter",
      soilSuitability: ["loamy", "clayey"],
      waterRequirement: "medium",
      minBudget: 150,
      experienceLevel: ["beginner", "intermediate", "expert"],
      ndviRange: [0.4, 0.9],
      climateConditions: ["cool", "dry"],
      pros: ["High market value", "Good storage life", "Multiple uses"],
      cons: ["Needs precise timing", "Weather sensitive", "Requires fertilizers"],
      profitability: "high",
      duration: "120-140 days",
      irrigationNeeded: true
    },
    maize: {
      name: "Maize/Corn",
      season: "summer",
      soilSuitability: ["loamy", "sandy"],
      waterRequirement: "medium",
      minBudget: 100,
      experienceLevel: ["beginner", "intermediate", "expert"],
      ndviRange: [0.5, 0.9],
      climateConditions: ["warm", "moderate"],
      pros: ["Fast growing", "Multiple uses", "Good profit margins"],
      cons: ["Bird attacks", "Wind damage risk", "Needs consistent water"],
      profitability: "high",
      duration: "90-120 days",
      irrigationNeeded: true
    },
    soybean: {
      name: "Soybean",
      season: "monsoon",
      soilSuitability: ["loamy", "clayey"],
      waterRequirement: "medium",
      minBudget: 120,
      experienceLevel: ["intermediate", "expert"],
      ndviRange: [0.4, 0.8],
      climateConditions: ["warm", "humid"],
      pros: ["High protein content", "Nitrogen fixing", "Good export market"],
      cons: ["Disease prone", "Market volatility", "Processing needed"],
      profitability: "high",
      duration: "90-120 days",
      irrigationNeeded: false
    },
    cotton: {
      name: "Cotton",
      season: "summer",
      soilSuitability: ["clayey", "loamy"],
      waterRequirement: "high",
      minBudget: 300,
      experienceLevel: ["expert"],
      ndviRange: [0.3, 0.7],
      climateConditions: ["hot", "dry"],
      pros: ["High value crop", "Industrial demand", "Long term profit"],
      cons: ["High investment", "Pest management critical", "Water intensive"],
      profitability: "very high",
      duration: "150-180 days",
      irrigationNeeded: true
    },
    sugarcane: {
      name: "Sugarcane",
      season: "monsoon",
      soilSuitability: ["clayey", "loamy"],
      waterRequirement: "very high",
      minBudget: 500,
      experienceLevel: ["expert"],
      ndviRange: [0.4, 0.9],
      climateConditions: ["tropical", "humid"],
      pros: ["Very high returns", "Long crop cycle", "Multiple products"],
      cons: ["Very high investment", "Labor intensive", "Processing dependency"],
      profitability: "very high",
      duration: "300-365 days",
      irrigationNeeded: true
    },
    tomato: {
      name: "Tomato",
      season: "winter",
      soilSuitability: ["loamy", "sandy"],
      waterRequirement: "medium",
      minBudget: 80,
      experienceLevel: ["beginner", "intermediate"],
      ndviRange: [0.5, 0.8],
      climateConditions: ["cool", "moderate"],
      pros: ["High market demand", "Short duration", "Good returns"],
      cons: ["Disease prone", "Market fluctuation", "Storage issues"],
      profitability: "high",
      duration: "60-90 days",
      irrigationNeeded: true
    },
    onion: {
      name: "Onion",
      season: "winter",
      soilSuitability: ["loamy", "sandy"],
      waterRequirement: "medium",
      minBudget: 100,
      experienceLevel: ["intermediate", "expert"],
      ndviRange: [0.3, 0.7],
      climateConditions: ["cool", "dry"],
      pros: ["Staple vegetable", "Good storage", "Consistent demand"],
      cons: ["Price volatility", "Storage requirements", "Curing needed"],
      profitability: "medium",
      duration: "120-150 days",
      irrigationNeeded: true
    },
    potato: {
      name: "Potato",
      season: "winter",
      soilSuitability: ["sandy", "loamy"],
      waterRequirement: "medium",
      minBudget: 150,
      experienceLevel: ["beginner", "intermediate"],
      ndviRange: [0.4, 0.8],
      climateConditions: ["cool", "moderate"],
      pros: ["High yield", "Multiple uses", "Good market"],
      cons: ["Storage critical", "Disease management", "Market timing"],
      profitability: "medium",
      duration: "90-120 days",
      irrigationNeeded: true
    },
    mustard: {
      name: "Mustard",
      season: "winter",
      soilSuitability: ["loamy", "clayey"],
      waterRequirement: "low",
      minBudget: 50,
      experienceLevel: ["beginner", "intermediate"],
      ndviRange: [0.3, 0.6],
      climateConditions: ["cool", "dry"],
      pros: ["Low investment", "Oil seed crop", "Short duration"],
      cons: ["Lower returns", "Weather dependent", "Limited market"],
      profitability: "low",
      duration: "90-110 days",
      irrigationNeeded: false
    }
  };

  // Get user email from localStorage
  const getUserEmail = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const { email } = JSON.parse(userData);
        return email;
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
    return null;
  };

  // Fetch user fields
  const fetchFields = async () => {
    try {
      const email = getUserEmail();
      if (!email) return;

      const response = await axios.get(`http://localhost:3001/api/fields?email=${email}`);
      
      if (response.data.fields && Array.isArray(response.data.fields)) {
        setFields(response.data.fields);
      }
    } catch (err) {
      console.error("Error fetching fields:", err);
    }
  };

  // Calculate field area
  const calculatePolygonArea = (coordinates) => {
    if (!coordinates || coordinates.length < 3) return 0;
    
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }
    
    area = Math.abs(area) / 2;
    const areaHectares = area * 1232100; // Convert to hectares
    
    return areaHectares;
  };

  // Fetch field analysis data
  const fetchFieldAnalysis = async (field) => {
    if (!field?.geojson_data?.coordinates?.[0]) return null;

    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 5); // Exclude last 5 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 5);
      startDate.setMonth(startDate.getMonth() - 6); // 6 months back

      const geoCoords = field.geojson_data.coordinates[0];
      
      // Prepare coordinates for API
      const geoJSON = { 
        type: "Polygon", 
        coordinates: [[...geoCoords, geoCoords[0]].filter((coord, index, array) => 
          index === 0 || JSON.stringify(coord) !== JSON.stringify(array[0])
        )] 
      };

      // Fetch NDVI data
      let ndviData = [];
      try {
        const ndviResponse = await axios.post("http://127.0.0.1:5000/ndvi_time_series", {
          coordinates: geoJSON.coordinates[0],
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        });
        ndviData = ndviResponse.data.time_series || [];
      } catch (ndviError) {
        console.warn("Error fetching NDVI data:", ndviError);
      }

      // Fetch weather data
      let weatherData = null;
      try {
        const weatherResponse = await axios.post("http://localhost:3001/api/weather/data", {
          coordinates: geoCoords,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        });
        weatherData = weatherResponse.data;
      } catch (weatherError) {
        console.warn("Error fetching weather data:", weatherError);
      }

      return {
        field,
        ndviData,
        weatherData,
        averageNDVI: ndviData.length > 0 ? ndviData.reduce((sum, item) => sum + item.ndvi, 0) / ndviData.length : null
      };

    } catch (err) {
      console.error("Error fetching field analysis:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate intelligent crop recommendations
  const generateRecommendations = (requirements, fieldData = null) => {
    let scored = [];

    Object.entries(cropDatabase).forEach(([key, crop]) => {
      let score = 0;
      let reasons = [];

      // Budget compatibility (40% weight)
      if (requirements.budget >= crop.minBudget) {
        score += 40;
        reasons.push(`✓ Budget sufficient (₹${crop.minBudget} required)`);
      } else {
        score -= 20;
        reasons.push(`⚠️ Budget insufficient (₹${crop.minBudget} required)`);
      }

      // Experience level (20% weight)
      if (crop.experienceLevel.includes(requirements.experience)) {
        score += 20;
        reasons.push(`✓ Suitable for ${requirements.experience} farmers`);
      } else {
        score -= 10;
        reasons.push(`⚠️ Requires ${crop.experienceLevel.join('/')} experience`);
      }

      // Soil type compatibility (20% weight)
      if (requirements.soilType && crop.soilSuitability.some(soil => 
        requirements.soilType.toLowerCase().includes(soil.toLowerCase()))) {
        score += 20;
        reasons.push(`✓ Compatible with ${requirements.soilType} soil`);
      } else if (requirements.soilType) {
        score -= 5;
        reasons.push(`⚠️ Prefers ${crop.soilSuitability.join('/')} soil`);
      }

      // Irrigation compatibility (10% weight)
      if (requirements.irrigation === 'yes' && crop.irrigationNeeded) {
        score += 10;
        reasons.push(`✓ Irrigation available (required for this crop)`);
      } else if (requirements.irrigation === 'no' && !crop.irrigationNeeded) {
        score += 10;
        reasons.push(`✓ No irrigation needed`);
      } else if (requirements.irrigation === 'no' && crop.irrigationNeeded) {
        score -= 15;
        reasons.push(`⚠️ Requires irrigation (not available)`);
      }

      // Field analysis data integration (10% weight)
      if (fieldData?.averageNDVI) {
        const ndviMatch = fieldData.averageNDVI >= crop.ndviRange[0] && fieldData.averageNDVI <= crop.ndviRange[1];
        if (ndviMatch) {
          score += 10;
          reasons.push(`✓ Field NDVI (${fieldData.averageNDVI.toFixed(3)}) suits this crop`);
        } else {
          score -= 5;
          reasons.push(`⚠️ Field NDVI outside optimal range (${crop.ndviRange.join('-')})`);
        }
      }

      // Crop preference bonus
      if (requirements.cropPreference && 
          crop.name.toLowerCase().includes(requirements.cropPreference.toLowerCase())) {
        score += 15;
        reasons.push(`✓ Matches your preference`);
      }

      // Season compatibility
      const currentMonth = new Date().getMonth();
      let currentSeason = 'winter';
      if (currentMonth >= 3 && currentMonth <= 5) currentSeason = 'summer';
      else if (currentMonth >= 6 && currentMonth <= 9) currentSeason = 'monsoon';
      else if (currentMonth >= 10 && currentMonth <= 2) currentSeason = 'winter';

      if (crop.season === currentSeason) {
        score += 5;
        reasons.push(`✓ Suitable for current season`);
      }

      scored.push({
        ...crop,
        key,
        score: Math.max(0, score),
        reasons,
        compatibility: score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low'
      });
    });

    // Sort by score and return top recommendations
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // Top 6 recommendations
  };

  // Handle field selection for analysis
  const handleFieldSelect = async (field) => {
    setSelectedField(field);
    setUserRequirements(prev => ({ ...prev, useFieldAnalysis: true }));
    setError("");
    
    const analysisData = await fetchFieldAnalysis(field);
    setFieldAnalysisData(analysisData);
    
    // Auto-generate recommendations with current requirements and field data
    if (userRequirements.budget || userRequirements.soilType) {
      const newRecommendations = generateRecommendations(userRequirements, analysisData);
      setRecommendations(newRecommendations);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchFields();
    
    // Load form data if available
    if (formData) {
      setUserRequirements(prev => ({
        ...prev,
        ...formData
      }));
      
      // Generate initial recommendations
      const initialRecommendations = generateRecommendations(formData);
      setRecommendations(initialRecommendations);
    }
  }, []);

  // Update recommendations when requirements change
  useEffect(() => {
    if (Object.keys(userRequirements).length > 0) {
      const newRecommendations = generateRecommendations(userRequirements, fieldAnalysisData);
      setRecommendations(newRecommendations);
    }
  }, [userRequirements, fieldAnalysisData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserRequirements(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="crop-suggestion-page">
      <div className="suggestions-header">
        <h1 className="page-title">🌾 Smart Crop Recommendations</h1>
        <p className="page-subtitle">
          Get intelligent crop suggestions based on your field analysis and farming requirements
        </p>
      </div>

      <div className="suggestions-content">
        {/* Sidebar with field selection and requirements */}
        <div className="suggestions-sidebar">
          <div className="sidebar-section">
            <h3>Select Field</h3>
            {fields.length > 0 ? (
              <div className="fields-list">
                {fields.map(field => (
                  <div 
                    key={field.id} 
                    className={`field-item ${selectedField?.id === field.id ? 'selected' : ''}`}
                    onClick={() => handleFieldSelect(field)}
                  >
                    <div className="field-info">
                      <div className="field-name">{field.plot_name}</div>
                      <div className="field-meta">
                        {field.geojson_data?.coordinates?.[0] && (
                          <span className="field-area">
                            Area: {calculatePolygonArea(field.geojson_data.coordinates[0]).toFixed(2)} hectares
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-fields">
                <p>No fields found. Please create a field first.</p>
                <button 
                  onClick={() => navigate("/monitor-field")}
                  className="create-field-btn"
                >
                  Create Field
                </button>
              </div>
            )}
          </div>

          {selectedField && (
            <div className="sidebar-section">
              <h3>Field Information</h3>
              <div className="field-details">
                <p><strong>Name:</strong> {selectedField.plot_name}</p>
                <p><strong>Area:</strong> {
                  selectedField.geojson_data?.coordinates?.[0] 
                    ? `${calculatePolygonArea(selectedField.geojson_data.coordinates[0]).toFixed(2)} hectares`
                    : 'N/A'
                }</p>
                {fieldAnalysisData && (
                  <>
                    <p><strong>Avg NDVI:</strong> {fieldAnalysisData.averageNDVI?.toFixed(3) || 'N/A'}</p>
                    <p><strong>Data Points:</strong> {fieldAnalysisData.ndviData?.length || 0}</p>
                    <p><strong>Weather Data:</strong> {fieldAnalysisData.weatherData ? 'Available' : 'Limited'}</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="sidebar-section">
            <h3>Your Requirements</h3>
            
            <div className="requirements-form">
              <div className="form-group">
                <label>Budget (₹):</label>
                <input
                  type="number"
                  name="budget"
                  value={userRequirements.budget}
                  onChange={handleInputChange}
                  placeholder="Enter your budget"
                />
              </div>

              <div className="form-group">
                <label>Experience Level:</label>
                <select name="experience" value={userRequirements.experience} onChange={handleInputChange}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="form-group">
                <label>Soil Type:</label>
                <input
                  type="text"
                  name="soilType"
                  value={userRequirements.soilType}
                  onChange={handleInputChange}
                  placeholder="e.g., Sandy, Clayey, Loamy"
                />
              </div>

              <div className="form-group">
                <label>Irrigation Available:</label>
                <select name="irrigation" value={userRequirements.irrigation} onChange={handleInputChange}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Crop Preference (Optional):</label>
                <input
                  type="text"
                  name="cropPreference"
                  value={userRequirements.cropPreference}
                  onChange={handleInputChange}
                  placeholder="e.g., Rice, Wheat, Tomato"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                if (selectedField) {
                  const newRecommendations = generateRecommendations(userRequirements, fieldAnalysisData);
                  setRecommendations(newRecommendations);
                } else {
                  setError("Please select a field first");
                }
              }}
              disabled={!selectedField || loading}
              className="generate-recommendations-btn"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing...
                </>
              ) : "Get Recommendations"}
            </button>

            {error && (
              <div className="error-message">{error}</div>
            )}
          </div>
        </div>

        {/* Main recommendations content */}
        <div className="suggestions-main">
          {!selectedField ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <h3>🌾 Welcome to Smart Crop Recommendations</h3>
                <p>Select a field from the sidebar and fill in your requirements to get personalized crop suggestions including:</p>
                <ul>
                  <li>📊 Field analysis integration (NDVI, weather data)</li>
                  <li>💰 Budget-optimized recommendations</li>
                  <li>🎯 Experience-level matching</li>
                  <li>🌱 Soil type compatibility</li>
                  <li>📈 Profitability analysis</li>
                  <li>✅ Pros and cons evaluation</li>
                </ul>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <h3>📋 Ready for Recommendations</h3>
                <p>Field "{selectedField.plot_name}" selected. Fill in your requirements and click "Get Recommendations" to see personalized crop suggestions.</p>
                <div className="field-preview">
                  <h4>Selected Field Details:</h4>
                  <p>Area: {
                    selectedField.geojson_data?.coordinates?.[0] 
                      ? `${calculatePolygonArea(selectedField.geojson_data.coordinates[0]).toFixed(2)} hectares`
                      : 'N/A'
                  }</p>
                  {fieldAnalysisData && (
                    <>
                      <p>Average NDVI: {fieldAnalysisData.averageNDVI?.toFixed(3) || 'N/A'}</p>
                      <p>Analysis includes satellite and weather data for enhanced recommendations</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="recommendations-content">
              <div className="recommendations-header">
                <h2>🎯 Recommended Crops for {selectedField.plot_name}</h2>
                <div className="recommendations-meta">
                  <span>Based on field analysis and your requirements</span>
                  <span>Generated: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Analyzing field data and generating recommendations...</p>
                </div>
              )}

              <div className="crop-recommendations">
                {recommendations.map((crop, index) => (
                  <div key={crop.key} className={`crop-card ${crop.compatibility}`}>
                    <div className="crop-header">
                      <h4>
                        {index === 0 && <span className="best-badge">🏆 Best Match</span>}
                        {crop.name}
                      </h4>
                      <div className="score-badge">
                        Score: {crop.score}%
                      </div>
                    </div>

                    <div className="crop-details">
                      <div className="crop-info-grid">
                        <div className="info-item">
                          <span className="label">Season:</span>
                          <span className="value">{crop.season}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Duration:</span>
                          <span className="value">{crop.duration}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Investment:</span>
                          <span className="value">₹{crop.minBudget}+</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Profitability:</span>
                          <span className="value">{crop.profitability}</span>
                        </div>
                      </div>

                      <div className="compatibility-reasons">
                        <h5>Why this crop?</h5>
                        <ul>
                          {crop.reasons.slice(0, 4).map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pros-cons">
                        <div className="pros">
                          <h5>✅ Advantages</h5>
                          <ul>
                            {crop.pros.map((pro, idx) => (
                              <li key={idx}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="cons">
                          <h5>⚠️ Considerations</h5>
                          <ul>
                            {crop.cons.map((con, idx) => (
                              <li key={idx}>{con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="recommendations-actions">
                <button 
                  onClick={() => navigate("/requirements")}
                  className="secondary-btn"
                >
                  ← Update Requirements
                </button>
                <button 
                  onClick={() => navigate("/monitor-field")}
                  className="primary-btn"
                >
                  Monitor Selected Crop 🔍
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropSuggestion;
