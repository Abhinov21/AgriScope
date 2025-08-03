import os
import json
import google.generativeai as genai
from datetime import datetime
from flask import jsonify
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None
    print("⚠️ GEMINI_API_KEY not found. AI recommendations will not be available.")

def generate_ai_crop_recommendations(field_data, weather_data=None, vegetation_data=None):
    """
    Generate AI-powered crop recommendations using Gemini AI
    
    Args:
        field_data: Dictionary containing field information (location, soil, size, etc.)
        weather_data: Optional weather data for the field
        vegetation_data: Optional vegetation index data (NDVI, etc.)
    
    Returns:
        Dictionary with AI-generated crop recommendations
    """
    
    if not model:
        return {
            "error": "AI service not available. Please configure GEMINI_API_KEY.",
            "fallback": True
        }
    
    try:
        # Build comprehensive prompt for AI
        prompt = build_crop_recommendation_prompt(field_data, weather_data, vegetation_data)
        
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Parse AI response
        ai_recommendations = parse_ai_response(response.text)
        
        return {
            "status": "success",
            "ai_generated": True,
            "recommendations": ai_recommendations,
            "generated_at": datetime.now().isoformat(),
            "field_location": field_data.get('location', 'Unknown')
        }
        
    except Exception as e:
        print(f"Error generating AI recommendations: {e}")
        return {
            "error": f"AI recommendation failed: {str(e)}",
            "fallback": True
        }

def build_crop_recommendation_prompt(field_data, weather_data, vegetation_data):
    """Build a comprehensive prompt for intelligent, descriptive crop recommendations"""
    
    current_month = datetime.now().strftime("%B")
    current_year = datetime.now().year
    
    # Determine current season for India
    month_num = datetime.now().month
    if month_num in [3, 4, 5]:
        season = "Summer (Zaid season)"
        season_context = "Hot and dry season requiring heat-tolerant crops with efficient irrigation"
    elif month_num in [6, 7, 8, 9]:
        season = "Monsoon (Kharif season)" 
        season_context = "Rainy season ideal for major food grains, rice, sugarcane, and cotton"
    elif month_num in [10, 11, 12, 1, 2]:
        season = "Winter (Rabi season)"
        season_context = "Cool and dry season perfect for wheat, mustard, gram, and cash crops"
    else:
        season = "Transition period"
        season_context = "Season transition - plan for upcoming season requirements"

    prompt = f"""
You are an expert agricultural consultant with deep knowledge of Indian farming, market trends, and sustainable agriculture. 
Analyze the given field conditions and provide comprehensive, descriptive crop recommendations.

CURRENT CONTEXT:
- Date: {current_month} {current_year}
- Season: {season}
- Season Context: {season_context}

FIELD ANALYSIS REQUEST:
Location: {field_data.get('location', 'India')}
Field Size: {field_data.get('area', 'Not specified')} hectares
Soil Type: {field_data.get('soil_type', 'Not specified')}
Soil pH: {field_data.get('soil_ph', 'Not tested')}
Irrigation Available: {field_data.get('irrigation', 'Not specified')}
Farmer Experience: {field_data.get('experience', 'Not specified')}
Budget Range: {field_data.get('budget', 'Not specified')}
"""

    # Add weather data if available
    if weather_data:
        prompt += f"""
CURRENT WEATHER CONDITIONS:
Average Temperature: {weather_data.get('avg_temp', 'N/A')}°C
Expected Rainfall: {weather_data.get('rainfall', 'N/A')}mm
Humidity Levels: {weather_data.get('humidity', 'N/A')}%
Weather Pattern: {weather_data.get('pattern', 'Normal conditions expected')}
"""

    # Add vegetation data if available
    if vegetation_data:
        prompt += f"""
FIELD HEALTH INDICATORS:
NDVI Value: {vegetation_data.get('ndvi', 'Not available')}
Vegetation Health: {vegetation_data.get('health_status', 'Not assessed')}
Soil Moisture: {vegetation_data.get('soil_moisture', 'Not measured')}
"""

    prompt += f"""

PROVIDE A COMPREHENSIVE ANALYSIS IN THIS EXACT JSON FORMAT:
{{
    "land_analysis": {{
        "soil_assessment": "Detailed analysis of the soil type, pH, and suitability for different crops",
        "water_requirements": "Assessment of irrigation needs and water management strategies",
        "field_condition": "Overall field health and readiness for cultivation",
        "challenges": "Potential challenges based on current conditions",
        "opportunities": "Strengths and advantages of this field"
    }},
    "season_analysis": {{
        "current_season_suitability": "How well the current season suits farming activities",
        "optimal_planting_window": "Best time to plant recommended crops",
        "weather_considerations": "Important weather factors to consider"
    }},
    "market_insights": {{
        "current_trends": "Current market trends for agricultural products",
        "profitable_categories": "Which crop categories are showing good market demand",
        "price_outlook": "Expected price trends for recommended crops",
        "market_timing": "Best time to harvest and sell for maximum profit"
    }},
    "recommended_crops": [
        {{
            "name": "Primary Crop Recommendation",
            "variety": "Specific variety or hybrid recommended",
            "why_suitable": "Detailed explanation of why this crop is perfect for your field",
            "market_potential": "Current market demand and profit potential",
            "investment_needed": "Estimated investment required",
            "expected_returns": "Projected returns and profit margins",
            "growing_tips": "Key cultivation practices for success",
            "harvest_timeline": "When to plant and when to harvest",
            "risk_factors": "Potential risks and mitigation strategies"
        }},
        {{
            "name": "Secondary Crop Recommendation", 
            "variety": "Alternative variety option",
            "why_suitable": "Why this is a good backup option",
            "market_potential": "Market prospects for this crop",
            "investment_needed": "Budget requirements",
            "expected_returns": "Profit potential",
            "growing_tips": "Important cultivation notes",
            "harvest_timeline": "Planting and harvest schedule",
            "risk_factors": "Associated risks"
        }},
        {{
            "name": "Alternative/Mixed Crop Option",
            "variety": "Third option or intercropping suggestion",
            "why_suitable": "Benefits of this alternative approach",
            "market_potential": "Market viability",
            "investment_needed": "Financial requirements",
            "expected_returns": "Expected profitability",
            "growing_tips": "Special considerations",
            "harvest_timeline": "Timeline details",
            "risk_factors": "Risk assessment"
        }}
    ],
    "action_plan": {{
        "immediate_steps": "What to do right now to prepare for planting",
        "soil_preparation": "Specific soil preparation recommendations",
        "input_procurement": "Seeds, fertilizers, and other inputs to arrange",
        "timeline": "Week-by-week action plan for the next 2 months",
        "success_indicators": "How to measure if you're on track for good yields"
    }},
    "sustainability_advice": {{
        "organic_options": "Organic farming possibilities for these crops",
        "water_conservation": "Water-saving techniques applicable",
        "soil_health": "Long-term soil health maintenance",
        "crop_rotation": "Future crop rotation suggestions"
    }}
}}

IMPORTANT: 
- Focus on REAL, CURRENT market conditions and profitable crops for {current_month} {current_year}
- Provide specific, actionable advice tailored to the given field conditions
- Consider the farmer's experience level and budget constraints
- Include region-specific varieties and techniques
- Make recommendations that maximize profitability while being practical
- Ensure all advice is scientifically sound and market-relevant

Respond ONLY with the JSON structure above, no additional text.
"""

    return prompt
- NDVI Score: {vegetation_data.get('ndvi', 'N/A')} (Vegetation health indicator)
- Soil Health: {vegetation_data.get('soil_health', 'Average')}
- Previous Crop Performance: {vegetation_data.get('prev_performance', 'Unknown')}

"""

    prompt += """
REQUIREMENTS:
Please provide crop recommendations in the following JSON format. Give exactly 3 crop recommendations, prioritized by suitability:

{
    "primary_crop": {
        "name": "Crop name",
        "variety": "Specific variety if applicable",
        "suitability_score": 95,
        "planting_season": "Best time to plant",
        "harvest_time": "Expected harvest period",
        "expected_yield": "Expected yield per hectare",
        "market_price": "Current market price range",
        "water_requirement": "Water needs (Low/Medium/High)",
        "investment_cost": "Estimated cost per hectare",
        "profit_potential": "Expected profit margins",
        "growing_tips": [
            "Specific tip 1",
            "Specific tip 2",
            "Specific tip 3"
        ],
        "challenges": [
            "Potential challenge 1",
            "Potential challenge 2"
        ],
        "market_demand": "High/Medium/Low with explanation"
    },
    "secondary_crop": {
        // Same structure as primary_crop
    },
    "alternative_crop": {
        // Same structure as primary_crop
    },
    "general_advice": {
        "soil_preparation": "Specific soil prep advice",
        "fertilizer_plan": "NPK and organic fertilizer recommendations",
        "pest_management": "Common pests and prevention",
        "irrigation_schedule": "Optimal watering schedule",
        "companion_crops": ["Crops that grow well together"],
        "crop_rotation": "Future crop rotation suggestions"
    },
    "seasonal_calendar": {
        "pre_monsoon": "Activities before monsoon",
        "monsoon": "Monsoon season activities", 
        "post_monsoon": "Post-monsoon activities",
        "winter": "Winter season activities"
    }
}

Focus on:
1. Crops suitable for the current season and location
2. Economic viability and market demand
3. Water availability and irrigation requirements
4. Farmer's experience level and budget
5. Sustainable farming practices
6. Local climate patterns and soil conditions

Provide practical, implementable advice that considers Indian agricultural practices, government schemes, and local market conditions.
"""

    return prompt

def parse_ai_response(ai_text):
    """Parse the AI response and extract the new descriptive format"""
    
    try:
        # Try to find JSON content in the response
        start_idx = ai_text.find('{')
        end_idx = ai_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = ai_text[start_idx:end_idx]
            recommendations = json.loads(json_str)
            
            # Validate that we have the expected structure
            if all(key in recommendations for key in ['land_analysis', 'recommended_crops', 'market_insights']):
                return recommendations
            else:
                # If structure is wrong, use fallback
                return parse_text_response(ai_text)
        else:
            # If JSON parsing fails, create structured response from text
            return parse_text_response(ai_text)
            
    except json.JSONDecodeError:
        # Fallback: parse as text and structure it
        return parse_text_response(ai_text)

def parse_text_response(text):
    """Fallback parser for non-JSON responses - creates a descriptive format"""
    
    # Basic text parsing as fallback with new structure
    return {
        "land_analysis": {
            "soil_assessment": "AI analysis available in full response below",
            "field_condition": "Requires detailed analysis based on provided conditions",
            "challenges": "Please refer to the full AI response for specific challenges",
            "opportunities": "Consult full response for field opportunities"
        },
        "season_analysis": {
            "current_season_suitability": "Based on current season timing",
            "optimal_planting_window": "Seasonal recommendations in full response"
        },
        "market_insights": {
            "current_trends": "Market analysis included in AI response",
            "profitable_categories": "Refer to full response for profit analysis"
        },
        "recommended_crops": [
            {
                "name": "AI Recommended Crop",
                "why_suitable": "Based on comprehensive AI analysis below",
                "market_potential": "See full analysis for market details",
                "growing_tips": "Detailed tips available in complete response",
                "ai_full_response": text
            }
        ],
        "action_plan": {
            "immediate_steps": "Review the complete AI analysis below for actionable steps",
            "timeline": "Detailed timeline available in full response"
        },
        "ai_note": "The AI provided a text response instead of structured format. Full response is available in the recommended crops section."
    }

def get_fallback_recommendations():
    """Fallback recommendations when AI is not available - descriptive format"""
    
    current_month = datetime.now().strftime("%B")
    
    return {
        "status": "fallback",
        "ai_generated": False,
        "land_analysis": {
            "soil_assessment": "Unable to perform detailed soil analysis without AI service. Please ensure your soil is well-drained and has adequate nutrients.",
            "water_requirements": "Standard irrigation practices recommended based on crop selection.",
            "field_condition": "Basic field preparation including plowing and leveling is essential.",
            "challenges": "Without detailed analysis, common challenges include pest management and weather dependency.",
            "opportunities": "Good field management can lead to profitable harvests with proper crop selection."
        },
        "season_analysis": {
            "current_season_suitability": f"{current_month} is generally suitable for season-appropriate crops",
            "optimal_planting_window": "Follow traditional planting calendars for your region",
            "weather_considerations": "Monitor local weather forecasts and plan accordingly"
        },
        "market_insights": {
            "current_trends": "Consult local market prices and agricultural extension services",
            "profitable_categories": "Food grains and cash crops typically show steady demand",
            "price_outlook": "Market prices vary by region and season",
            "market_timing": "Harvest timing affects market prices significantly"
        },
        "recommended_crops": [
            {
                "name": "Wheat (Winter Season) / Rice (Monsoon) / Sugarcane (Annual)",
                "variety": "Local adapted varieties recommended",
                "why_suitable": "These are generally suitable crops based on traditional farming practices",
                "market_potential": "Stable market demand for staple crops",
                "investment_needed": "Moderate investment for seeds, fertilizers, and irrigation",
                "expected_returns": "Returns depend on yield and market prices",
                "growing_tips": "Follow recommended agricultural practices for your region",
                "harvest_timeline": "Varies by crop and planting time",
                "risk_factors": "Weather dependency and market price fluctuations"
            }
        ],
        "action_plan": {
            "immediate_steps": "Configure AI service for detailed recommendations, consult local agricultural experts",
            "soil_preparation": "Test soil pH and nutrients, prepare beds as per crop requirements",
            "input_procurement": "Source quality seeds and fertilizers from authorized dealers",
            "timeline": "Plan according to local agricultural calendar",
            "success_indicators": "Regular monitoring of crop growth and health"
        },
        "sustainability_advice": {
            "organic_options": "Consider organic certification for premium markets",
            "water_conservation": "Adopt drip irrigation and rainwater harvesting",
            "soil_health": "Use organic matter and cover crops to improve soil",
            "crop_rotation": "Rotate crops to maintain soil fertility and prevent pests"
        },
        "note": "For AI-powered, personalized recommendations, please configure the GEMINI_API_KEY in your environment variables."
    }
