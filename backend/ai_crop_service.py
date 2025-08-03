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
    """Build a comprehensive prompt for the AI model"""
    
    current_month = datetime.now().strftime("%B")
    current_year = datetime.now().year
    
    prompt = f"""
You are an expert agricultural advisor with deep knowledge of Indian farming, crop selection, and precision agriculture. 
Provide specific, actionable crop recommendations for a farm field with the following characteristics:

FIELD INFORMATION:
- Location: {field_data.get('location', 'India')}
- Field Size: {field_data.get('area', 'Unknown')} hectares
- Soil Type: {field_data.get('soil_type', 'Not specified')}
- Soil pH: {field_data.get('soil_ph', 'Not tested')}
- Irrigation: {field_data.get('irrigation', 'Not specified')}
- Current Month: {current_month} {current_year}
- Farmer Experience: {field_data.get('experience', 'Not specified')}
- Budget: {field_data.get('budget', 'Not specified')}

"""

    # Add weather data if available
    if weather_data:
        prompt += f"""
WEATHER CONDITIONS:
- Average Temperature: {weather_data.get('avg_temp', 'N/A')}°C
- Rainfall: {weather_data.get('rainfall', 'N/A')}mm
- Humidity: {weather_data.get('humidity', 'N/A')}%
- Recent Weather Pattern: {weather_data.get('pattern', 'Normal')}

"""

    # Add vegetation data if available
    if vegetation_data:
        prompt += f"""
FIELD HEALTH DATA:
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
    """Parse the AI response and extract JSON data"""
    
    try:
        # Try to find JSON content in the response
        start_idx = ai_text.find('{')
        end_idx = ai_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx != -1:
            json_str = ai_text[start_idx:end_idx]
            recommendations = json.loads(json_str)
            return recommendations
        else:
            # If JSON parsing fails, create structured response from text
            return parse_text_response(ai_text)
            
    except json.JSONDecodeError:
        # Fallback: parse as text and structure it
        return parse_text_response(ai_text)

def parse_text_response(text):
    """Fallback parser for non-JSON responses"""
    
    # Basic text parsing as fallback
    return {
        "primary_crop": {
            "name": "Based on AI Analysis",
            "suitability_score": 85,
            "growing_tips": text.split('\n')[:3],  # First 3 lines as tips
            "ai_full_response": text
        },
        "general_advice": {
            "note": "Full AI response available in primary_crop.ai_full_response"
        }
    }

def get_fallback_recommendations():
    """Fallback recommendations when AI is not available"""
    
    return {
        "status": "fallback",
        "ai_generated": False,
        "recommendations": {
            "primary_crop": {
                "name": "Wheat",
                "variety": "HD-2967 (High yielding)",
                "suitability_score": 80,
                "planting_season": "October-November",
                "harvest_time": "March-April",
                "expected_yield": "45-50 quintals/hectare",
                "growing_tips": [
                    "Ensure proper seed treatment before sowing",
                    "Maintain optimal soil moisture during flowering",
                    "Apply balanced NPK fertilization"
                ]
            },
            "general_advice": {
                "note": "These are basic recommendations. For AI-powered suggestions, please configure GEMINI_API_KEY."
            }
        }
    }
