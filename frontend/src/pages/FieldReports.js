// src/pages/FieldReports.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FieldList from "../components/FieldList";
import NDVITimeSeriesChart from "../components/NDVITimeSeriesChart";
import WeatherChart from "../components/WeatherChart";
import "../styles/fieldReports.css";

const FieldReports = () => {
  const navigate = useNavigate();
  
  // State management
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [ndviData, setNdviData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);

  // Date range for last 6 months (excluding last 5 days for weather data reliability)
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 5); // Exclude last 5 days for NASA POWER API reliability
    return date;
  });
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 5); // End date adjusted
    date.setMonth(date.getMonth() - 6); // Start 6 months before adjusted end date
    return date;
  });

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
    navigate("/login");
    return null;
  };

  // Show notifications
  const showNotification = (message, isError = false) => {
    setError(isError ? message : "");
    
    if (!isError) {
      const tempMessage = document.createElement("div");
      tempMessage.className = "success-notification";
      tempMessage.textContent = message;
      document.body.appendChild(tempMessage);
      
      setTimeout(() => {
        if (document.body.contains(tempMessage)) {
          document.body.removeChild(tempMessage);
        }
      }, 3000);
    }
  };

  // Fetch user fields
  const fetchFields = async () => {
    try {
      const email = getUserEmail();
      if (!email) return;

      const response = await axios.get(`http://localhost:5000/api/fields?email=${email}`);
      
      if (response.data.fields && Array.isArray(response.data.fields)) {
        setFields(response.data.fields);
      } else {
        console.error("Invalid field data format:", response.data);
        showNotification("Error loading fields: Invalid data format", true);
      }
    } catch (err) {
      console.error("Error fetching fields:", err);
      showNotification(`Error loading fields: ${err.message || "Unknown error"}`, true);
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

  // NDVI Analysis Functions
  const analyzeNDVITrends = (ndviData) => {
    if (!ndviData || ndviData.length === 0) return null;

    const values = ndviData.map(item => item.ndvi);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const maximum = Math.max(...values);
    const minimum = Math.min(...values);

    // Calculate trend (simple linear regression slope)
    const n = values.length;
    const sumX = values.reduce((sum, _, index) => sum + index, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumXX = values.reduce((sum, _, index) => sum + (index * index), 0);
    
    const trend = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Determine health status based on average NDVI
    const healthStatus = getHealthStatus(average);

    // Generate recommendations based on analysis
    const recommendations = generateRecommendations(average, trend, minimum, maximum);

    return {
      average,
      maximum,
      minimum,
      trend,
      healthStatus,
      recommendations
    };
  };

  // Get health status based on NDVI value
  const getHealthStatus = (avgNdvi) => {
    if (avgNdvi >= 0.7) {
      return {
        status: "Excellent",
        color: "#28a745",
        emoji: "🌟"
      };
    } else if (avgNdvi >= 0.5) {
      return {
        status: "Good",
        color: "#20c997",
        emoji: "✅"
      };
    } else if (avgNdvi >= 0.3) {
      return {
        status: "Fair",
        color: "#ffc107",
        emoji: "⚠️"
      };
    } else if (avgNdvi >= 0.2) {
      return {
        status: "Poor",
        color: "#fd7e14",
        emoji: "⚡"
      };
    } else {
      return {
        status: "Critical",
        color: "#dc3545",
        emoji: "🚨"
      };
    }
  };

  // Generate smart recommendations based on NDVI analysis
  const generateRecommendations = (average, trend, minimum, maximum) => {
    const recommendations = [];

    // Health-based recommendations
    if (average < 0.3) {
      recommendations.push("🌱 Consider soil testing to identify nutrient deficiencies");
      recommendations.push("💧 Evaluate irrigation system effectiveness");
      recommendations.push("🔍 Inspect for pest or disease issues");
    } else if (average < 0.5) {
      recommendations.push("🌿 Monitor vegetation closely for stress indicators");
      recommendations.push("💊 Consider targeted fertilizer application");
    } else if (average >= 0.7) {
      recommendations.push("🌟 Excellent vegetation health - maintain current practices");
      recommendations.push("📅 Continue regular monitoring schedule");
    }

    // Trend-based recommendations
    if (trend < -0.01) {
      recommendations.push("📉 Declining trend detected - investigate potential causes");
      recommendations.push("🔧 Consider adjusting management practices");
    } else if (trend > 0.01) {
      recommendations.push("📈 Positive growth trend - current management is effective");
    } else {
      recommendations.push("➡️ Stable vegetation - maintain consistent care");
    }

    // Variability-based recommendations
    if ((maximum - minimum) > 0.4) {
      recommendations.push("📊 High NDVI variability suggests uneven field conditions");
      recommendations.push("🎯 Consider zone-specific management strategies");
    }

    // Seasonal recommendations
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 4) { // Spring
      recommendations.push("🌸 Spring season: Monitor for new growth and pest emergence");
    } else if (currentMonth >= 5 && currentMonth <= 7) { // Summer
      recommendations.push("☀️ Summer season: Ensure adequate water supply during peak growth");
    } else if (currentMonth >= 8 && currentMonth <= 10) { // Fall
      recommendations.push("🍂 Fall season: Prepare for harvest and post-harvest management");
    } else { // Winter
      recommendations.push("❄️ Winter season: Plan for next growing season");
    }

    return recommendations.slice(0, 6); // Limit to 6 recommendations
  };

  // Handle field selection
  const handleFieldSelect = (field) => {
    setSelectedField(field);
    setReportGenerated(false);
    setNdviData([]);
    setWeatherData(null);
    setError("");
    
    if (field.geojson_data?.coordinates?.[0]) {
      const areaHectares = calculatePolygonArea(field.geojson_data.coordinates[0]);
      showNotification(`Selected "${field.plot_name}" - Area: ${areaHectares.toFixed(2)} hectares`);
    }
  };

  // Generate comprehensive field report
  const generateFieldReport = async () => {
    if (!selectedField) {
      showNotification("Please select a field to generate report", true);
      return;
    }

    const geoCoords = selectedField.geojson_data?.coordinates[0];
    if (!geoCoords) {
      showNotification("Selected field has no coordinate data", true);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Prepare coordinates for API
      const geoJSON = { 
        type: "Polygon", 
        coordinates: [[...geoCoords, geoCoords[0]].filter((coord, index, array) => 
          index === 0 || JSON.stringify(coord) !== JSON.stringify(array[0])
        )] 
      };

      // Fetch NDVI time series data
      try {
        const ndviResponse = await axios.post("http://127.0.0.1:5000/ndvi_time_series", {
          coordinates: geoJSON.coordinates[0],
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        });
        
        setNdviData(ndviResponse.data.time_series || []);
      } catch (ndviError) {
        console.warn("Error fetching NDVI data:", ndviError);
        showNotification("NDVI data could not be retrieved", true);
      }

      // Fetch weather data
      try {
        // Note: NASA POWER API typically has 4-5 day processing delay
        // So we exclude recent days to ensure data availability
        const weatherResponse = await axios.post("http://localhost:5000/api/weather/data", {
          coordinates: geoCoords,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        });
        
        setWeatherData(weatherResponse.data);
      } catch (weatherError) {
        console.warn("Error fetching weather data:", weatherError);
        showNotification("Weather data could not be retrieved", true);
      }

      setReportGenerated(true);
      showNotification("Field report generated successfully!");
      
    } catch (err) {
      console.error("Error generating field report:", err);
      showNotification(`Failed to generate field report: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Toggle advanced analysis view
  const toggleAdvancedAnalysis = () => {
    setShowAdvancedAnalysis(!showAdvancedAnalysis);
  };

  // Initialize component
  useEffect(() => {
    fetchFields();
  }, []);

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="field-reports-page">
      <div className="reports-header">
        <h1 className="page-title">📊 Field Reports</h1>
        <p className="page-subtitle">
          Comprehensive analysis of your agricultural fields over the last 6 months (excluding recent 5 days for data reliability)
        </p>
      </div>

      <div className="reports-content">
        {/* Sidebar with field selection */}
        <div className="reports-sidebar">
          <div className="sidebar-section">
            <h3>Select Field</h3>
            <FieldList
              fields={fields}
              selectedField={selectedField}
              onFieldSelect={handleFieldSelect}
              onFieldDelete={() => {}} // Disable delete in reports view
              onFieldRename={() => {}} // Disable rename in reports view
              compact={true}
            />
          </div>

          {selectedField && (
            <div className="sidebar-section">
              <h3>Field Information</h3>
              <div className="field-info">
                <p><strong>Name:</strong> {selectedField.plot_name}</p>
                <p><strong>Area:</strong> {
                  selectedField.geojson_data?.coordinates?.[0] 
                    ? `${calculatePolygonArea(selectedField.geojson_data.coordinates[0]).toFixed(2)} hectares`
                    : 'N/A'
                }</p>
                <p><strong>Report Period:</strong></p>
                <p className="date-range">
                  {formatDate(startDate)} to {formatDate(endDate)}
                </p>
              </div>
            </div>
          )}

          <div className="sidebar-section">
            <button 
              onClick={generateFieldReport}
              disabled={!selectedField || loading}
              className="generate-report-btn"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating Report...
                </>
              ) : "Generate Field Report"}
            </button>

            {reportGenerated && (
              <button 
                onClick={toggleAdvancedAnalysis}
                className={`analysis-btn ${showAdvancedAnalysis ? 'active' : ''}`}
              >
                {showAdvancedAnalysis ? '📊 Basic Report' : '� Advanced Analysis'}
              </button>
            )}
          </div>

          {error && (
            <div className="sidebar-section">
              <div className="error-message">{error}</div>
            </div>
          )}
        </div>

        {/* Main report content */}
        <div className="reports-main">
          {!selectedField ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <h3>🌾 Welcome to Field Reports</h3>
                <p>Select a field from the sidebar to generate a comprehensive report including:</p>
                <ul>
                  <li>📈 NDVI time series analysis</li>
                  <li>🌤️ Weather data trends (excluding recent 5 days)</li>
                  <li>📊 Vegetation health insights</li>
                  <li>🔍 Rule-based analytics and recommendations</li>
                </ul>
              </div>
            </div>
          ) : !reportGenerated ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <h3>📋 Generate Report for "{selectedField.plot_name}"</h3>
                <p>Click "Generate Field Report" to view comprehensive analysis for the last 6 months</p>
                <div className="field-preview">
                  <h4>Field Details:</h4>
                  <p>Area: {
                    selectedField.geojson_data?.coordinates?.[0] 
                      ? `${calculatePolygonArea(selectedField.geojson_data.coordinates[0]).toFixed(2)} hectares`
                      : 'N/A'
                  }</p>
                  <p>Analysis Period: {formatDate(startDate)} - {formatDate(endDate)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="report-content">
              <div className="report-header">
                <h2>📊 Field Report: {selectedField.plot_name}</h2>
                <div className="report-meta">
                  <span>Period: {formatDate(startDate)} - {formatDate(endDate)}</span>
                  <span>Generated: {formatDate(new Date())}</span>
                </div>
                {/* Advanced Analysis Button - Only show when in basic view */}
                {!showAdvancedAnalysis && (
                  <div className="report-header-actions">
                    <button 
                      onClick={toggleAdvancedAnalysis}
                      className="primary-btn"
                    >
                      🔬 View Advanced Analysis
                    </button>
                  </div>
                )}
              </div>

              {!showAdvancedAnalysis ? (
                /* Basic Report View */
                <>
                  {/* NDVI Section */}
                  <div className="report-section">
                    <h3>🌱 NDVI Analysis</h3>
                    <div className="chart-container">
                      {ndviData && ndviData.length > 0 ? (
                        <>
                          <NDVITimeSeriesChart data={ndviData} />
                          <div className="chart-insights">
                            <h4>Key Insights:</h4>
                            <ul>
                              <li>Total data points: {ndviData.length}</li>
                              <li>Average NDVI: {(ndviData.reduce((sum, item) => sum + item.ndvi, 0) / ndviData.length).toFixed(3)}</li>
                              <li>Max NDVI: {Math.max(...ndviData.map(item => item.ndvi)).toFixed(3)}</li>
                              <li>Min NDVI: {Math.min(...ndviData.map(item => item.ndvi)).toFixed(3)}</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <div className="no-data">
                          <p>⚠️ NDVI data not available for this period</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weather Section */}
                  <div className="report-section">
                    <h3>🌤️ Weather Analysis</h3>
                    <div className="chart-container">
                      {weatherData ? (
                        <>
                          <WeatherChart data={weatherData} />
                          <div className="chart-insights">
                            <h4>Weather Summary:</h4>
                            <ul>
                              <li>Data points available: {weatherData.length || 'N/A'}</li>
                              <li>Analysis includes temperature, precipitation, and humidity trends</li>
                              <li>Weather patterns correlate with vegetation health (NDVI)</li>
                              <li>⚠️ Recent 5 days excluded due to NASA POWER API processing delays</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <div className="no-data">
                          <p>⚠️ Weather data not available for this period</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="report-section">
                    <h3>📋 Report Summary</h3>
                    <div className="summary-cards">
                      <div className="summary-card">
                        <h4>🌾 Field Health</h4>
                        <p>
                          {ndviData && ndviData.length > 0 
                            ? `Average NDVI: ${(ndviData.reduce((sum, item) => sum + item.ndvi, 0) / ndviData.length).toFixed(3)}`
                            : 'Data not available'
                          }
                        </p>
                      </div>
                      <div className="summary-card">
                        <h4>📊 Data Coverage</h4>
                        <p>
                          NDVI: {ndviData ? ndviData.length : 0} points<br/>
                          Weather: {weatherData ? 'Available' : 'Limited'}
                        </p>
                      </div>
                      <div className="summary-card">
                        <h4>🔍 Next Steps</h4>
                        <p>Use Advanced Analysis for detailed insights and recommendations</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Advanced Analysis View */
                <div className="advanced-analysis-section">
                  <div className="analysis-header-info">
                    <h3>🔬 Advanced Field Analysis: {selectedField.plot_name}</h3>
                    <p className="analysis-period">
                      Analysis Period: {formatDate(startDate)} - {formatDate(endDate)}
                    </p>
                  </div>

                  {/* NDVI Trend Analysis */}
                  {ndviData && ndviData.length > 0 && (
                    <div className="analysis-section">
                      <h4>🌱 NDVI Trend Analysis</h4>
                      
                      <div className="charts-grid">
                        <div className="chart-container">
                          <NDVITimeSeriesChart data={ndviData} />
                        </div>
                        
                        <div className="analysis-insights">
                          {(() => {
                            const analysis = analyzeNDVITrends(ndviData);
                            if (!analysis) return <p>No analysis available</p>;
                            
                            return (
                              <>
                                <div className="health-status">
                                  <h5>Field Health Status</h5>
                                  <div 
                                    className="status-badge"
                                    style={{ backgroundColor: analysis.healthStatus.color }}
                                  >
                                    {analysis.healthStatus.emoji} {analysis.healthStatus.status}
                                  </div>
                                </div>
                                
                                <div className="metrics-grid">
                                  <div className="metric">
                                    <span className="metric-label">Average NDVI</span>
                                    <span className="metric-value">{analysis.average.toFixed(3)}</span>
                                  </div>
                                  <div className="metric">
                                    <span className="metric-label">Maximum</span>
                                    <span className="metric-value">{analysis.maximum.toFixed(3)}</span>
                                  </div>
                                  <div className="metric">
                                    <span className="metric-label">Minimum</span>
                                    <span className="metric-value">{analysis.minimum.toFixed(3)}</span>
                                  </div>
                                  <div className="metric">
                                    <span className="metric-label">Trend</span>
                                    <span className={`metric-value ${analysis.trend > 0 ? 'positive' : analysis.trend < 0 ? 'negative' : 'neutral'}`}>
                                      {analysis.trend > 0.001 ? '📈 Improving' : analysis.trend < -0.001 ? '📉 Declining' : '➡️ Stable'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="recommendations">
                                  <h5>🎯 Smart Recommendations</h5>
                                  <ul>
                                    {analysis.recommendations.map((rec, index) => (
                                      <li key={index}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weather Impact Analysis */}
                  {weatherData && (
                    <div className="analysis-section">
                      <h4>🌤️ Weather Impact Analysis</h4>
                      <div className="chart-container">
                        <WeatherChart data={weatherData} />
                      </div>
                      <div className="weather-insights">
                        <h5>Weather Insights</h5>
                        <ul>
                          <li>📊 Complete weather data coverage for the selected period</li>
                          <li>🌡️ Temperature variations may affect vegetation growth patterns</li>
                          <li>🌤️ Weather data correlates with vegetation health (NDVI)</li>
                          <li>🌿 Optimal growing conditions identification helps with crop planning</li>
                          <li>⚠️ Recent 5 days excluded due to NASA POWER API processing delays</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Field Summary */}
                  <div className="analysis-section">
                    <h4>📋 Comprehensive Field Summary</h4>
                    <div className="summary-grid">
                      <div className="summary-card">
                        <h5>🌾 Field Information</h5>
                        <p><strong>Field Name:</strong> {selectedField.plot_name}</p>
                        <p><strong>Analysis Period:</strong> 6 months</p>
                        <p><strong>Data Quality:</strong> {ndviData ? 'High' : 'Limited'}</p>
                      </div>
                      
                      <div className="summary-card">
                        <h5>� Key Findings</h5>
                        {ndviData && ndviData.length > 0 ? (
                          <>
                            <p>Average vegetation health: {getHealthStatus(ndviData.reduce((sum, item) => sum + item.ndvi, 0) / ndviData.length).status}</p>
                            <p>Data reliability: {ndviData.length} measurement points</p>
                            <p>Trend analysis: Available</p>
                          </>
                        ) : (
                          <p>Limited NDVI data available for comprehensive analysis</p>
                        )}
                      </div>
                      
                      <div className="summary-card">
                        <h5>📈 Next Steps</h5>
                        <p>• Monitor vegetation trends continuously</p>
                        <p>• Implement recommended management practices</p>
                        <p>• Schedule regular field assessments</p>
                        <p>• Consider soil testing for detailed insights</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="report-actions">
                {showAdvancedAnalysis && (
                  <button 
                    onClick={toggleAdvancedAnalysis}
                    className="primary-btn"
                  >
                    📊 Back to Basic Report
                  </button>
                )}
                <button 
                  onClick={() => window.print()}
                  className="secondary-btn"
                >
                  🖨️ Print Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldReports;
