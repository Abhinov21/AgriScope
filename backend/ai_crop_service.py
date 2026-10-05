import json
import logging
import os
import re
from datetime import datetime

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
GEMINI_TIMEOUT_MS = 30_000

RECOMMENDATION_SCHEMA = {
    "type": "object",
    "properties": {
        "land_analysis": {"type": "object"},
        "season_analysis": {"type": "object"},
        "market_insights": {"type": "object"},
        "recommended_crops": {"type": "array"},
        "action_plan": {"type": "object"},
        "sustainability_advice": {"type": "object"},
    },
    "required": [
        "land_analysis",
        "season_analysis",
        "market_insights",
        "recommended_crops",
        "action_plan",
        "sustainability_advice",
    ],
}

client = None
if GEMINI_API_KEY:
    client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=types.HttpOptions(timeout=GEMINI_TIMEOUT_MS),
    )


def generate_ai_crop_recommendations(field_data, weather_data=None, vegetation_data=None):
    """Generate recommendations using Gemini or raise when the AI service fails."""
    if client is None:
        raise RuntimeError("Gemini client is not configured")

    prompt = build_crop_recommendation_prompt(
        field_data, weather_data, vegetation_data
    )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RECOMMENDATION_SCHEMA,
                temperature=0.2,
                max_output_tokens=2048,
            ),
        )
        recommendations = parse_ai_response(response.text)
    except Exception as exc:
        logger.error("Gemini recommendation request failed: %s", type(exc).__name__)
        raise RuntimeError("Gemini recommendation request failed") from exc

    return {
        "status": "success",
        "ai_generated": True,
        "recommendations": recommendations,
        "generated_at": datetime.now().isoformat(),
        "field_location": field_data.get("location", "Unknown"),
    }


def build_crop_recommendation_prompt(field_data, weather_data=None, vegetation_data=None):
    """Build a concise prompt for the single response schema used by the UI."""
    current_month = datetime.now().strftime("%B")
    current_year = datetime.now().year

    prompt = f"""
You are an agricultural consultant for farms in India. Recommend practical crops based
only on the supplied field data. Do not claim access to live market data; mark market
information as an estimate and tell the farmer to verify local prices.

Date: {current_month} {current_year}
Field data: {json.dumps(field_data, ensure_ascii=True)}
Weather data: {json.dumps(weather_data or {}, ensure_ascii=True)}
Vegetation data: {json.dumps(vegetation_data or {}, ensure_ascii=True)}

Return only valid JSON with exactly these top-level keys:
land_analysis, season_analysis, market_insights, recommended_crops,
action_plan, sustainability_advice.
Use objects for the five analysis sections and an array of three crop objects.
Each crop object should include name, variety, why_suitable, market_potential,
investment_needed, expected_returns, growing_tips, harvest_timeline, and risk_factors.
Keep every value a string, number, or array of strings. Do not include markdown.
"""
    return prompt.strip()


def parse_ai_response(ai_text):
    """Parse and validate Gemini JSON without converting failures into fake AI output."""
    if not ai_text or not ai_text.strip():
        raise ValueError("Gemini returned an empty response")

    cleaned_text = re.sub(
        r"^```(?:json)?\s*|\s*```$", "", ai_text.strip(), flags=re.IGNORECASE
    ).strip()

    decoder = json.JSONDecoder()
    for match in re.finditer(r"\{", cleaned_text):
        try:
            recommendations, _ = decoder.raw_decode(cleaned_text[match.start() :])
        except json.JSONDecodeError:
            continue

        if _is_valid_recommendation_schema(recommendations):
            return recommendations

    raise ValueError("Gemini returned invalid recommendation JSON")


def _is_valid_recommendation_schema(value):
    required_keys = set(RECOMMENDATION_SCHEMA["required"])
    if not isinstance(value, dict) or not required_keys.issubset(value):
        return False

    object_keys = (
        "land_analysis",
        "season_analysis",
        "market_insights",
        "action_plan",
        "sustainability_advice",
    )
    if any(not isinstance(value[key], dict) for key in object_keys):
        return False

    crops = value["recommended_crops"]
    return isinstance(crops, list) and all(isinstance(crop, dict) for crop in crops)


def get_fallback_recommendations():
    """Return a complete response in the same schema as an AI response."""
    current_month = datetime.now().strftime("%B")
    return {
        "status": "fallback",
        "ai_generated": False,
        "recommendations": {
            "land_analysis": {
                "soil_assessment": "Test soil pH and nutrients before selecting a crop.",
                "water_requirements": "Use irrigation appropriate for the selected crop and local water availability.",
                "field_condition": "Prepare, level, and inspect the field before planting.",
                "challenges": "Weather, pests, and market price changes may affect yields and returns.",
                "opportunities": "Local crop varieties and good field management can reduce risk.",
            },
            "season_analysis": {
                "current_season_suitability": f"Use crops suited to the {current_month} planting window in your region.",
                "optimal_planting_window": "Confirm dates with the local agricultural extension office.",
                "weather_considerations": "Monitor local forecasts before planting and applying inputs.",
            },
            "market_insights": {
                "current_trends": "Verify current demand with nearby markets or agricultural extension services.",
                "profitable_categories": "Profitability depends on local prices, yield, and input costs.",
                "price_outlook": "No live price data is available from this fallback response.",
                "market_timing": "Compare local prices and storage costs before selling.",
            },
            "recommended_crops": [
                {
                    "name": "Regionally adapted staple crop",
                    "variety": "Choose a locally recommended variety.",
                    "why_suitable": "A local variety is more likely to match regional soil and climate conditions.",
                    "market_potential": "Verify demand and prices with local buyers.",
                    "investment_needed": "Estimate seed, labor, fertilizer, irrigation, and pest-control costs.",
                    "expected_returns": "Returns depend on final yield and selling price.",
                    "growing_tips": "Follow local soil-test and crop-extension recommendations.",
                    "harvest_timeline": "Follow the selected variety's local planting calendar.",
                    "risk_factors": "Weather, pests, disease, and price volatility.",
                }
            ],
            "action_plan": {
                "immediate_steps": "Test soil, confirm water availability, and consult local crop guidance.",
                "soil_preparation": "Remove weeds and prepare soil according to test results.",
                "input_procurement": "Source certified seed and approved inputs from authorized suppliers.",
                "timeline": "Plan weekly field checks from preparation through harvest.",
                "success_indicators": "Track germination, plant health, water use, pests, and costs.",
            },
            "sustainability_advice": {
                "organic_options": "Use compost and integrated pest management where suitable.",
                "water_conservation": "Prefer drip or scheduled irrigation where practical.",
                "soil_health": "Maintain organic matter and avoid unnecessary soil disturbance.",
                "crop_rotation": "Rotate crop families to support soil health and reduce pest pressure.",
            },
        },
        "error": "AI recommendations are temporarily unavailable.",
    }
