import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl, getFlaskApiUrl } from "../config/api";
import "../styles/CropSuggestion.css";

const CropSuggestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  // State management for AI-driven recommendations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [fields, setFields] = useState([]);
  const [userRequirements, setUserRequirements] = useState({
    budget: '',
    experience: 'beginner',
    soilType: '',
    irrigation: 'yes',
    location: '',
    area: '',
    previousCrop: '',
    useFieldAnalysis: false
  });

  // Initialize form data if available
  useEffect(() => {
    if (formData) {
      setUserRequirements(prev => ({
        ...prev,
        budget: formData.budget || '',
        experience: formData.experience || 'beginner',
        soilType: formData.soilType || '',
        irrigation: formData.irrigation || 'yes',
        location: formData.location || ''
      }));
    }
  }, [formData]);

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

      const response = await axios.get(`${getApiUrl()}/api/fields?email=${email}`);
      
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
        const ndviResponse = await axios.post(`${getFlaskApiUrl()}/ndvi_time_series`, {
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
        const weatherResponse = await axios.post(`${getApiUrl()}/api/weather/data`, {
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
  // AI-powered crop recommendation function
  const generateAIRecommendations = async (requirements, fieldData = null) => {
    try {
      setLoading(true);
      setError("");

      // Prepare field data for AI
      const fieldInfo = {
        location: requirements.location || "India",
        area: fieldData?.area || "Not specified",
        soil_type: requirements.soilType || "Not specified",
        soil_ph: fieldData?.soilPH || "Not tested", 
        irrigation: requirements.irrigation === 'yes' ? 'Available' : 'Not available',
        experience: requirements.experience || "Not specified",
        budget: requirements.budget ? `Rs. ${requirements.budget}` : "Not specified"
      };

      // Prepare weather data if available
      const weatherInfo = fieldData?.weather ? {
        avg_temp: fieldData.weather.avgTemp,
        rainfall: fieldData.weather.rainfall,
        humidity: fieldData.weather.humidity,
        pattern: "Normal"
      } : null;

      // Prepare vegetation data if available
      const vegetationInfo = fieldData ? {
        ndvi: fieldData.averageNDVI,
        soil_health: fieldData.averageNDVI > 0.6 ? "Good" : fieldData.averageNDVI > 0.4 ? "Average" : "Poor",
        prev_performance: "Unknown"
      } : null;

      const response = await axios.post(`${getFlaskApiUrl()}/api/crop-recommendations`, {
        field_data: fieldInfo,
        weather_data: weatherInfo,
        vegetation_data: vegetationInfo
      });

      if (response.data.error) {
        // Fall back to hardcoded recommendations
        console.warn("AI recommendations failed, using fallback:", response.data.error);
        return generateFallbackRecommendations(requirements, fieldData);
      }

      // Transform AI response to match our UI format
      return transformAIRecommendations(response.data.recommendations);

    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      setError("Failed to get AI recommendations. Using fallback method.");
      // Fall back to original hardcoded method
      return generateFallbackRecommendations(requirements, fieldData);
    } finally {
      setLoading(false);
    }
  };

  // Transform AI response to match our UI format
  const transformAIRecommendations = (aiRecommendations) => {
    const transformed = [];

    // Add primary crop
    if (aiRecommendations.primary_crop) {
      transformed.push(transformCropData(aiRecommendations.primary_crop, 1, aiRecommendations));
    }

    // Add secondary crop
    if (aiRecommendations.secondary_crop) {
      transformed.push(transformCropData(aiRecommendations.secondary_crop, 2, aiRecommendations));
    }

    // Add alternative crop
    if (aiRecommendations.alternative_crop) {
      transformed.push(transformCropData(aiRecommendations.alternative_crop, 3, aiRecommendations));
    }

    return transformed;
  };

  const transformCropData = (aiCrop, rank, aiRecommendations) => {
    return {
      name: aiCrop.name,
      variety: aiCrop.variety || "Standard variety",
      score: aiCrop.suitability_score || (100 - rank * 5),
      reasons: aiCrop.growing_tips || ["AI recommended based on your field conditions"],
      profitability: aiCrop.profit_potential || "Good",
      season: aiCrop.planting_season || "Current season",
      duration: aiCrop.harvest_time || "Standard duration",
      waterRequirement: aiCrop.water_requirement || "Medium",
      budget: aiCrop.investment_cost || "As per your budget",
      marketPrice: aiCrop.market_price || "Current market rates",
      expectedYield: aiCrop.expected_yield || "Good yield expected",
      challenges: aiCrop.challenges || ["Normal farming challenges"],
      pros: aiCrop.growing_tips || ["AI recommended benefits"],
      cons: aiCrop.challenges || ["Standard challenges"],
      marketDemand: aiCrop.market_demand || "Good demand",
      aiGenerated: true,
      generalAdvice: rank === 1 ? {
        soilPreparation: aiRecommendations.general_advice?.soil_preparation,
        fertilizerPlan: aiRecommendations.general_advice?.fertilizer_plan,
        pestManagement: aiRecommendations.general_advice?.pest_management,
        irrigationSchedule: aiRecommendations.general_advice?.irrigation_schedule,
        companionCrops: aiRecommendations.general_advice?.companion_crops,
        cropRotation: aiRecommendations.general_advice?.crop_rotation
      } : null
    };
  };

  // Main recommendation function that chooses between AI and fallback
  const generateRecommendations = async (requirements, fieldData = null) => {
    try {
      // Try AI recommendations first
      return await generateAIRecommendations(requirements, fieldData);
    } catch (error) {
      console.warn("Falling back to hardcoded recommendations:", error);
      return generateFallbackRecommendations(requirements, fieldData);
    }
  };

  // Fallback to original hardcoded recommendations
  const generateFallbackRecommendations = (requirements, fieldData = null) => {
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
      generateRecommendations(userRequirements, analysisData).then(newRecommendations => {
        setRecommendations(newRecommendations);
      });
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
      generateRecommendations(formData).then(initialRecommendations => {
        setRecommendations(initialRecommendations);
      });
    }
  }, []);

  // Update recommendations when requirements change
  useEffect(() => {
    if (Object.keys(userRequirements).length > 0) {
      generateRecommendations(userRequirements, fieldAnalysisData).then(newRecommendations => {
        setRecommendations(newRecommendations);
      });
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
                  generateRecommendations(userRequirements, fieldAnalysisData).then(newRecommendations => {
                    setRecommendations(newRecommendations);
                  });
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
