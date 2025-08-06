import React, { useState } from 'react';
import axios from 'axios';
import { getFlaskApiUrl } from '../config/api';
import '../styles/CropSuggestion.css';

const CropSuggestion = () => {
    const [formData, setFormData] = useState({
        location: '',
        area: '',
        soil_type: '',
        soil_ph: '',
        irrigation: '',
        experience: '',
        budget: '',
        previous_crop: ''
    });

    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const generateAIRecommendations = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRecommendations(null);

        try {
            const response = await axios.post(`${getFlaskApiUrl()}/api/crop-recommendations`, {
                field_data: formData,
                weather_data: null,
                vegetation_data: null
            });

            if (response.data.status === 'success') {
                setRecommendations(response.data.recommendations);
            } else if (response.data.fallback) {
                setRecommendations(response.data);
                setError('AI service not available. Showing fallback recommendations.');
            } else {
                setError(response.data.error || 'Failed to get recommendations');
            }
        } catch (err) {
            console.error('Error getting AI recommendations:', err);
            setError('Failed to connect to recommendation service. Please check if the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const renderAnalysisSection = (title, data, icon) => {
        if (!data) return null;

        return (
            <div className="analysis-section">
                <h3 className="analysis-title">
                    <span className="analysis-icon">{icon}</span>
                    {title}
                </h3>
                <div className="analysis-content">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="analysis-item">
                            <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                            <p>{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCropRecommendations = (crops) => {
        if (!crops || !Array.isArray(crops)) return null;

        return (
            <div className="crop-recommendations-section">
                <h3 className="section-title">
                    <span className="section-icon">🌾</span>
                    AI-Recommended Crops
                </h3>
                <div className="crops-grid">
                    {crops.map((crop, index) => (
                        <div key={index} className="crop-recommendation-card">
                            <h4 className="crop-name">{crop.name}</h4>
                            {crop.variety && (
                                <p className="crop-variety"><strong>Variety:</strong> {crop.variety}</p>
                            )}
                            
                            <div className="crop-details">
                                <div className="crop-detail-item">
                                    <strong>Why Suitable:</strong>
                                    <p>{crop.why_suitable}</p>
                                </div>
                                
                                <div className="crop-detail-item">
                                    <strong>Market Potential:</strong>
                                    <p>{crop.market_potential}</p>
                                </div>
                                
                                {crop.investment_needed && (
                                    <div className="crop-detail-item">
                                        <strong>Investment Needed:</strong>
                                        <p>{crop.investment_needed}</p>
                                    </div>
                                )}
                                
                                {crop.expected_returns && (
                                    <div className="crop-detail-item">
                                        <strong>Expected Returns:</strong>
                                        <p>{crop.expected_returns}</p>
                                    </div>
                                )}
                                
                                {crop.growing_tips && (
                                    <div className="crop-detail-item">
                                        <strong>Growing Tips:</strong>
                                        <p>{crop.growing_tips}</p>
                                    </div>
                                )}
                                
                                {crop.harvest_timeline && (
                                    <div className="crop-detail-item">
                                        <strong>Timeline:</strong>
                                        <p>{crop.harvest_timeline}</p>
                                    </div>
                                )}
                                
                                {crop.risk_factors && (
                                    <div className="crop-detail-item">
                                        <strong>Risk Factors:</strong>
                                        <p>{crop.risk_factors}</p>
                                    </div>
                                )}

                                {crop.ai_full_response && (
                                    <div className="crop-detail-item">
                                        <strong>Complete AI Analysis:</strong>
                                        <div className="ai-response-text">
                                            <pre>{crop.ai_full_response}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="crop-suggestion-container">
            <div className="crop-suggestion-header">
                <h1>🤖 AI-Powered Crop Recommendations</h1>
                <p className="subtitle">Get intelligent, market-aware farming advice tailored to your land</p>
            </div>

            <form onSubmit={generateAIRecommendations} className="crop-form">
                <div className="form-section">
                    <h3>📍 Field Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="e.g., Punjab, India"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="area">Field Size (hectares)</label>
                            <input
                                type="number"
                                id="area"
                                name="area"
                                value={formData.area}
                                onChange={handleInputChange}
                                placeholder="e.g., 2.5"
                                step="0.1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="soil_type">Soil Type</label>
                            <select
                                id="soil_type"
                                name="soil_type"
                                value={formData.soil_type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Soil Type</option>
                                <option value="clay">Clay</option>
                                <option value="sandy">Sandy</option>
                                <option value="loamy">Loamy</option>
                                <option value="silt">Silt</option>
                                <option value="chalky">Chalky</option>
                                <option value="peaty">Peaty</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="soil_ph">Soil pH (optional)</label>
                            <input
                                type="number"
                                id="soil_ph"
                                name="soil_ph"
                                value={formData.soil_ph}
                                onChange={handleInputChange}
                                placeholder="e.g., 6.5"
                                step="0.1"
                                min="0"
                                max="14"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="irrigation">Irrigation Facilities</label>
                            <select
                                id="irrigation"
                                name="irrigation"
                                value={formData.irrigation}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Irrigation Type</option>
                                <option value="drip">Drip Irrigation</option>
                                <option value="sprinkler">Sprinkler Irrigation</option>
                                <option value="flood">Flood Irrigation</option>
                                <option value="rainwater">Rainwater Dependent</option>
                                <option value="borewell">Borewell</option>
                                <option value="canal">Canal Water</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="experience">Farming Experience</label>
                            <select
                                id="experience"
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Experience Level</option>
                                <option value="beginner">Beginner (0-2 years)</option>
                                <option value="intermediate">Intermediate (3-10 years)</option>
                                <option value="experienced">Experienced (10+ years)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="budget">Budget Range (₹)</label>
                            <select
                                id="budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Budget Range</option>
                                <option value="low">Low (₹10,000 - ₹50,000)</option>
                                <option value="medium">Medium (₹50,000 - ₹2,00,000)</option>
                                <option value="high">High (₹2,00,000+)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="previous_crop">Previous Crop (optional)</label>
                            <input
                                type="text"
                                id="previous_crop"
                                name="previous_crop"
                                value={formData.previous_crop}
                                onChange={handleInputChange}
                                placeholder="e.g., Wheat, Rice, Cotton"
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="generate-btn"
                    disabled={loading}
                >
                    {loading ? '🤖 AI Analyzing...' : '🚀 Generate AI Recommendations'}
                </button>
            </form>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {recommendations && (
                <div className="recommendations-container">
                    <div className="ai-attribution">
                        <p>
                            <span className="ai-icon">🤖</span>
                            <strong>AI-Generated Analysis</strong> - 
                            Powered by advanced agricultural intelligence for market-aware recommendations
                        </p>
                    </div>

                    <div className="analysis-cards">
                        {recommendations.land_analysis && 
                            renderAnalysisSection('Land Analysis', recommendations.land_analysis, '🌍')}
                        
                        {recommendations.season_analysis && 
                            renderAnalysisSection('Season Analysis', recommendations.season_analysis, '🌤️')}
                        
                        {recommendations.market_insights && 
                            renderAnalysisSection('Market Insights', recommendations.market_insights, '📈')}
                    </div>

                    {recommendations.recommended_crops && 
                        renderCropRecommendations(recommendations.recommended_crops)}

                    <div className="analysis-cards">
                        {recommendations.action_plan && 
                            renderAnalysisSection('Action Plan', recommendations.action_plan, '📋')}
                        
                        {recommendations.sustainability_advice && 
                            renderAnalysisSection('Sustainability Advice', recommendations.sustainability_advice, '♻️')}
                    </div>

                    {recommendations.ai_note && (
                        <div className="ai-note">
                            <p><strong>Note:</strong> {recommendations.ai_note}</p>
                        </div>
                    )}

                    {recommendations.note && (
                        <div className="fallback-note">
                            <p><strong>Note:</strong> {recommendations.note}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CropSuggestion;
