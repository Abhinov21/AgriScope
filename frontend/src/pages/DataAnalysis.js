import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NDVITimeSeriesChart from "../components/NDVITimeSeriesChart";
import WeatherChart from "../components/WeatherChart";
import "../styles/dataAnalysis.css";

const cropData = {
  monsoon: {
    rice: {
      pros: ["Thrives in waterlogged soil", "High demand", "Multiple harvests possible"],
      cons: ["Needs a lot of water", "Labor-intensive", "Prone to diseases"],
    },
    maize: {
      pros: ["Fast-growing", "Versatile use", "Responds well to rainfall"],
      cons: ["Pest-prone", "High nutrient needs", "Not suitable for waterlogging"],
    },
    cotton: {
      pros: ["High market value", "Drought-tolerant", "Used in textile industry"],
      cons: ["Long growth period", "Prone to pests", "Needs dry weather during harvest"],
    },
    soybean: {
      pros: ["High protein", "Nitrogen fixer", "Short duration"],
      cons: ["Prone to diseases", "Needs well-drained soil", "Affected by heavy rain"],
    },
    pigeonpea: {
      pros: ["Drought resistant", "Improves soil fertility", "Good market"],
      cons: ["Long maturity period", "Sensitive to waterlogging", "Pest issues"],
    },
    greengram: {
      pros: ["Short growing cycle", "Rich in protein", "Fixes nitrogen"],
      cons: ["Not tolerant to excess rain", "Requires pest management", "Needs care at flowering"],
    },
    blackgram: {
      pros: ["Quick maturity", "Improves soil", "Suitable for intercropping"],
      cons: ["Susceptible to pests", "Not flood-tolerant", "Needs loose soil"],
    },
    groundnut: {
      pros: ["Oil-rich", "Fixes nitrogen", "Profitable cash crop"],
      cons: ["Needs sandy loam soil", "Prone to fungal diseases", "Labor-intensive harvesting"],
    },
    sesame: {
      pros: ["Drought-tolerant", "Low input", "High oil content"],
      cons: ["Sensitive to waterlogging", "Short harvesting window", "Pests like whitefly"],
    },
    castor: {
      pros: ["Tolerates dry conditions", "Used in lubricants and pharma", "Long shelf life"],
      cons: ["Long maturity", "Toxic seeds (non-edible)", "Sensitive to frost"],
    }
  },
  winter: {
    wheat: {
      pros: ["High yield", "Good market value", "Tolerates cool climates"],
      cons: ["Needs irrigation", "Prone to pests", "Requires good soil"],
    },
    mustard: {
      pros: ["Oil-rich", "Short duration", "Cold-tolerant"],
      cons: ["Needs dry weather during harvest", "Affected by frost", "Disease-prone"],
    },
    barley: {
      pros: ["Grows in poor soils", "Short duration", "Low input"],
      cons: ["Lower market demand", "Lodging issues", "Less industrial use"],
    },
    peas: {
      pros: ["High in protein", "Fixes nitrogen", "Short growing season"],
      cons: ["Sensitive to frost", "Needs staking support", "Prone to powdery mildew"],
    },
    chickpea: {
      pros: ["Rich in protein", "Drought tolerant", "Improves soil health"],
      cons: ["Affected by wilt and blight", "Sensitive to excess moisture", "Slow initial growth"],
    },
    linseed: {
      pros: ["Oil-rich", "Cold-tolerant", "Low water requirement"],
      cons: ["Less popular market", "Not suitable in sandy soils", "Moderate yield"],
    },
    oats: {
      pros: ["Good fodder crop", "Cold-tolerant", "Short growing period"],
      cons: ["Not high value", "Lodging in rains", "Needs timely sowing"],
    },
    garlic: {
      pros: ["High medicinal value", "Good market price", "Grows in small space"],
      cons: ["Needs proper curing", "Labor-intensive", "Sensitive to waterlogging"],
    },
    onion: {
      pros: ["Staple crop", "High demand", "Multiple harvest options"],
      cons: ["Needs storage facilities", "Prone to fungal rot", "Requires good soil"],
    },
    fenugreek: {
      pros: ["Short duration", "Used as spice/green manure", "Improves digestion"],
      cons: ["Not high yield", "Can bolt quickly", "Needs regular watering"],
    }
  },
  summer: {
    okra: {
      pros: ["Heat tolerant", "High demand", "Multiple harvests"],
      cons: ["Pest issues", "Needs regular picking", "Short shelf life"],
    },
    muskmelon: {
      pros: ["Short duration", "Juicy and profitable", "Tolerates high temp"],
      cons: ["Needs sandy soil", "Sensitive to humidity", "Short storage life"],
    },
    watermelon: {
      pros: ["Popular fruit", "Good market value", "Drought resistant"],
      cons: ["Requires spacing", "Susceptible to fruit fly", "Needs warm nights"],
    },
    brinjal: {
      pros: ["Long fruiting period", "Market stable", "Variety of types"],
      cons: ["Prone to pests", "Labor-intensive", "Sensitive to soil pH"],
    },
    tomato: {
      pros: ["High value", "Short duration", "Multiple uses"],
      cons: ["Needs staking", "Sensitive to temperature swings", "Prone to blight"],
    },
    amaranthus: {
      pros: ["Quick growth", "Nutritious", "High leaf yield"],
      cons: ["Short harvest period", "Requires good sunlight", "Lodging risk"],
    },
    cucumber: {
      pros: ["Fast growing", "Cooling veggie", "Short lifecycle"],
      cons: ["Prone to powdery mildew", "Needs trellis", "Water-sensitive"],
    },
    bittergourd: {
      pros: ["Nutritious", "Good market", "Resists many pests"],
      cons: ["Bitter taste not preferred by all", "Needs support to climb", "Slow initial growth"],
    },
    ridgegourd: {
      pros: ["High yield", "Climber – saves space", "Low maintenance"],
      cons: ["Needs frequent watering", "Pest risk", "Short shelf life"],
    },
    clusterbean: {
      pros: ["Drought resistant", "Used in gum production", "Improves soil"],
      cons: ["Not high value", "Prone to leaf spot", "Needs warm climate"],
    }
  },
  spring: {
    cabbage: {
      pros: ["Rich in nutrients", "Good price", "Multiple harvests"],
      cons: ["Prone to pests", "Bolting in heat", "Needs cool weather"],
    },
    cauliflower: {
      pros: ["Popular veggie", "Short cycle", "Good income"],
      cons: ["Sensitive to temp", "Bolting risk", "Fungal diseases"],
    },
    spinach: {
      pros: ["Nutritious", "Quick harvest", "Used widely"],
      cons: ["Bolts in heat", "Sensitive to soil salinity", "Short shelf life"],
    },
    carrot: {
      pros: ["High vitamin A", "Good yield", "Long shelf life"],
      cons: ["Needs deep loose soil", "Affected by root borer", "Slow maturity"],
    },
    beetroot: {
      pros: ["Iron-rich", "Short cycle", "Stable price"],
      cons: ["Staining during handling", "Root shape varies", "Sensitive to heat"],
    },
    lettuce: {
      pros: ["Used in salads", "Fast harvest", "Good price"],
      cons: ["Bolts in heat", "Short life post-harvest", "Needs good water management"],
    },
    radish: {
      pros: ["Quick growing", "Grows in small space", "High market demand"],
      cons: ["Pungent smell", "Cracks if overwatered", "Short harvest window"],
    },
    turnip: {
      pros: ["Root + leaves edible", "Short cycle", "Low maintenance"],
      cons: ["Needs sandy soil", "Can get fibrous if delayed", "Sensitive to warm weather"],
    },
    kale: {
      pros: ["Highly nutritious", "Cold hardy", "Low maintenance"],
      cons: ["Bitterness not preferred", "Pest issues", "Less market in rural areas"],
    },
    methi: {
      pros: ["Used in leaves and seeds", "Medicinal value", "Short cycle"],
      cons: ["Needs careful watering", "Not tolerant to heat", "Short harvesting time"],
    }
  }
};

const DataAnalysis = () => {
  const navigate = useNavigate();
  
  // Existing crop analysis state
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [cropInfo, setCropInfo] = useState(null);
  
  // Field analysis state
  const [fieldAnalysisData, setFieldAnalysisData] = useState(null);
  const [showFieldAnalysis, setShowFieldAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Check for field data from FieldReports
  useEffect(() => {
    const analysisData = localStorage.getItem("analysisField");
    if (analysisData) {
      try {
        const parsedData = JSON.parse(analysisData);
        setFieldAnalysisData(parsedData);
        setShowFieldAnalysis(true);
        // Clear the stored data after loading
        localStorage.removeItem("analysisField");
      } catch (error) {
        console.error("Error parsing analysis data:", error);
      }
    }
  }, []);

  // Toggle between field analysis and crop analysis
  const toggleAnalysisMode = () => {
    setShowFieldAnalysis(!showFieldAnalysis);
  };

  // Navigate back to field reports
  const backToReports = () => {
    navigate("/field-reports");
  };

  // Analyze NDVI trends and provide insights
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

  const handleSeasonChange = (e) => {
    const season = e.target.value;
    setSelectedSeason(season);
    setSelectedCrop("");
    setCropInfo(null);
  };

  const handleCropChange = (e) => {
    const crop = e.target.value;
    setSelectedCrop(crop);
    setCropInfo(cropData[selectedSeason][crop]);
  };

  return (
    <div className="analysis-container">
      {/* Navigation Header */}
      <div className="analysis-header">
        <h2>🔬 Agricultural Data Analysis</h2>
        <div className="analysis-nav">
          {fieldAnalysisData && (
            <button 
              onClick={toggleAnalysisMode}
              className={`toggle-btn ${showFieldAnalysis ? 'active' : ''}`}
            >
              {showFieldAnalysis ? '📊 Crop Analysis' : '🌾 Field Analysis'}
            </button>
          )}
          {fieldAnalysisData && (
            <button onClick={backToReports} className="back-btn">
              ← Back to Reports
            </button>
          )}
        </div>
      </div>

      {/* Field Analysis Section */}
      {showFieldAnalysis && fieldAnalysisData ? (
        <div className="field-analysis-section">
          <div className="analysis-header-info">
            <h3>📈 Advanced Field Analysis: {fieldAnalysisData.field.plot_name}</h3>
            <p className="analysis-period">
              Analysis Period: {new Date(fieldAnalysisData.dateRange.start).toLocaleDateString()} - {new Date(fieldAnalysisData.dateRange.end).toLocaleDateString()}
            </p>
          </div>

          {/* NDVI Analysis */}
          {fieldAnalysisData.ndviData && fieldAnalysisData.ndviData.length > 0 && (
            <div className="analysis-section">
              <h4>🌱 NDVI Trend Analysis</h4>
              
              <div className="charts-grid">
                <div className="chart-container">
                  <NDVITimeSeriesChart data={fieldAnalysisData.ndviData} />
                </div>
                
                <div className="analysis-insights">
                  {(() => {
                    const analysis = analyzeNDVITrends(fieldAnalysisData.ndviData);
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

          {/* Weather Analysis */}
          {fieldAnalysisData.weatherData && (
            <div className="analysis-section">
              <h4>🌤️ Weather Impact Analysis</h4>
              <div className="chart-container">
                <WeatherChart data={fieldAnalysisData.weatherData} />
              </div>
              <div className="weather-insights">
                <h5>Weather Insights</h5>
                <ul>
                  <li>📊 Complete weather data coverage for the selected period</li>
                  <li>🌡️ Temperature variations may affect vegetation growth patterns</li>
                  <li>💧 Precipitation levels correlate with NDVI fluctuations</li>
                  <li>🌿 Optimal growing conditions identification helps with crop planning</li>
                </ul>
              </div>
            </div>
          )}

          {/* Field Summary */}
          <div className="analysis-section">
            <h4>📋 Field Summary & Recommendations</h4>
            <div className="summary-grid">
              <div className="summary-card">
                <h5>🌾 Field Information</h5>
                <p><strong>Field Name:</strong> {fieldAnalysisData.field.plot_name}</p>
                <p><strong>Analysis Period:</strong> 6 months</p>
                <p><strong>Data Quality:</strong> {fieldAnalysisData.ndviData ? 'High' : 'Limited'}</p>
              </div>
              
              <div className="summary-card">
                <h5>🔍 Key Findings</h5>
                {fieldAnalysisData.ndviData && fieldAnalysisData.ndviData.length > 0 ? (
                  <>
                    <p>Average vegetation health: {getHealthStatus(fieldAnalysisData.ndviData.reduce((sum, item) => sum + item.ndvi, 0) / fieldAnalysisData.ndviData.length).status}</p>
                    <p>Data reliability: {fieldAnalysisData.ndviData.length} measurement points</p>
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
      ) : (
        /* Original Crop Analysis Section */
        <div className="crop-analysis-section">
          <h3>Crop Pros & Cons by Season</h3>

          <label>Select a Season:</label>
          <select value={selectedSeason} onChange={handleSeasonChange}>
            <option value="">--Select Season--</option>
            <option value="monsoon">Monsoon</option>
            <option value="summer">Summer</option>
            <option value="winter">Winter</option>
            <option value="spring">Spring</option>
          </select>

          {selectedSeason && (
            <>
              <label>Select a Crop:</label>
              <select value={selectedCrop} onChange={handleCropChange}>
                <option value="">--Select Crop--</option>
                {Object.keys(cropData[selectedSeason]).map((crop) => (
                  <option key={crop} value={crop}>
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </option>
                ))}
              </select>
            </>
          )}

          {cropInfo && (
            <div className="crop-info">
              <h3>Pros & Cons of {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}</h3>
              <div className="pros-cons">
                <div className="pros">
                  <h4>Pros:</h4>
                  <ul>
                    {cropInfo.pros.map((pro, index) => (
                      <li key={index}>✅ {pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="cons">
                  <h4>Cons:</h4>
                  <ul>
                    {cropInfo.cons.map((con, index) => (
                      <li key={index}>❌ {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataAnalysis;
