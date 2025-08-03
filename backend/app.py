import ee
import json
import time
import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import AI service
try:
    from ai_crop_service import generate_ai_crop_recommendations, get_fallback_recommendations
    AI_SERVICE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ AI service not available: {e}")
    AI_SERVICE_AVAILABLE = False

# ✅ Retry logic for Earth Engine initialization
MAX_RETRIES = 5
WAIT_SECONDS = 5
EE_INITIALIZED = False

def initialize_ee():
    global EE_INITIALIZED
    
    # Check for service account key first
    service_account_key = os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY')
    
    if service_account_key:
        print("🔑 Service account key found in environment variables")
        try:
            # Parse the service account key from environment variable
            service_account_info = json.loads(service_account_key)
            print(f"📧 Service account email: {service_account_info.get('client_email', 'N/A')}")
            print(f"📋 Project ID from key: {service_account_info.get('project_id', 'N/A')}")
            
            # Use the project from service account if available, otherwise fallback
            project_id = service_account_info.get('project_id', 'agriscope21')
            
            credentials = ee.ServiceAccountCredentials(
                service_account_info['client_email'],
                key_data=service_account_key
            )
            ee.Initialize(credentials, project=project_id)
            print(f"✅ Earth Engine initialized with service account for project: {project_id}")
            EE_INITIALIZED = True
            return
            
        except json.JSONDecodeError as json_error:
            print(f"❌ Invalid JSON in service account key: {json_error}")
        except KeyError as key_error:
            print(f"❌ Missing required field in service account key: {key_error}")
        except Exception as sa_error:
            print(f"❌ Service account authentication failed: {sa_error}")
    else:
        print("⚠️ No service account key found in GOOGLE_SERVICE_ACCOUNT_KEY environment variable")
    
    # Try default authentication methods
    for attempt in range(MAX_RETRIES):
        try:
            print(f"🔄 Attempt {attempt + 1}: Trying default Earth Engine authentication...")
            ee.Initialize(project='agriscope21')
            print("✅ Earth Engine initialized with default authentication!")
            EE_INITIALIZED = True
            return
        except Exception as e:
            print(f"⚠️ Attempt {attempt + 1} failed: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(WAIT_SECONDS)
    
    print("❌ All Earth Engine authentication methods failed")
    EE_INITIALIZED = False
    return

initialize_ee()

# ✅ Flask app setup
app = Flask(__name__)
# CORS(app, resources={r"/process_ndvi": {"origins": "*"}})
CORS(app)

# Health check endpoint for Render
@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment platforms"""
    return jsonify({
        'status': 'healthy',
        'service': 'AgriScope Flask Backend',
        'earth_engine_status': 'initialized' if EE_INITIALIZED else 'failed',
        'timestamp': datetime.now().isoformat()
    }), 200

# ✅ Generalized Vegetation Index Calculation Function
def calculate_vegetation_index(image, index_name):
    """
    Calculate a specified vegetation index using GEE server-side expressions.
    
    Args:
        image: ee.Image with bands B2 (Blue), B4 (Red), B8 (NIR), B11 (SWIR)
        index_name: String name of the index to calculate
        
    Returns:
        ee.Image with the calculated index
    """
    # Define the expressions for each vegetation index
    expressions = {
        'SR': 'NIR / R',
        'NDVI': '(NIR - R) / (NIR + R)',
        'EVI': '2.5 * ((NIR - R) / (NIR + 6 * R - 7.5 * B + 1))',
        'SAVI': '((NIR - R) / (NIR + R + 0.5)) * 1.5',  # Using L=0.5
        'ARVI': '(NIR - (2 * R - B)) / (NIR + (2 * R - B))',
        'MAVI': '(NIR - R) / (NIR + R + SWIR)'
    }
    
    if index_name not in expressions:
        raise ValueError(f"Unknown index name: {index_name}. Available indices: {list(expressions.keys())}")
    
    # Create band dictionary for expression
    band_dict = {
        'B': image.select('B2'),     # Blue
        'R': image.select('B4'),     # Red  
        'NIR': image.select('B8'),   # Near Infrared
        'SWIR': image.select('B11')  # Short Wave Infrared
    }
    
    # Calculate the index using the expression
    index_image = image.expression(expressions[index_name], band_dict).rename(index_name)
    
    return index_image

def get_visualization_params(index_name):
    """
    Get appropriate visualization parameters for each vegetation index.
    
    Args:
        index_name: String name of the index
        
    Returns:
        Dictionary with visualization parameters
    """
    vis_params = {
        'SR': {
            'min': 0, 'max': 8,
            'palette': ['red', 'orange', 'yellow', 'green', 'darkgreen']
        },
        'NDVI': {
            'min': -0.2, 'max': 1.0,
            'palette': ['blue', 'white', 'yellow', 'green', 'darkgreen']
        },
        'EVI': {
            'min': -0.2, 'max': 1.0,
            'palette': ['brown', 'yellow', 'lightgreen', 'green', 'darkgreen']
        },
        'SAVI': {
            'min': -0.2, 'max': 1.0,
            'palette': ['purple', 'blue', 'cyan', 'yellow', 'red']
        },
        'ARVI': {
            'min': -0.2, 'max': 1.0,
            'palette': ['red', 'orange', 'yellow', 'lightgreen', 'darkgreen']
        },
        'MAVI': {
            'min': -0.2, 'max': 1.0,
            'palette': ['red', 'yellow', 'lightblue', 'blue', 'darkblue']
        }
    }
    
    return vis_params.get(index_name, vis_params['NDVI'])  # Default to NDVI params

# ✅ Function to mask clouds using Sentinel-2 L2A SCL band
def mask_clouds(image):
    """
    Mask out cloudy and shadow pixels using the SCL band:
      3 = Cloud shadow
      8 = Cirrus
      9 = Cloud
      10 = High-probability cloud
    """
    scl = image.select('SCL')
    cloud_mask = scl.neq(3).And(scl.neq(8)).And(scl.neq(9)).And(scl.neq(10))
    return image.updateMask(cloud_mask)

# ✅ NDVI Calculation Function
def calculate_ndvi(image):
    """
    Calculate NDVI as (B8 - B4) / (B8 + B4).
    """
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    return image.addBands(ndvi).copyProperties(image, ['system:time_start'])

@app.route('/process_ndvi', methods=['POST'])
def process_ndvi():
    try:
        # ✅ Receive request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        coordinates = data.get('coordinates')
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if not coordinates or not start_date or not end_date:
            return jsonify({"error": "Missing required fields"}), 400

        if len(coordinates) < 3:
            return jsonify({"error": "AOI must have at least three coordinates"}), 400

        # ✅ Check if Earth Engine is available
        if not EE_INITIALIZED:
            return jsonify({"error": "Google Earth Engine is not initialized. Please check service account configuration."}), 503

        # ✅ Create AOI Polygon
        aoi = ee.Geometry.Polygon([coordinates])
        print("✅ AOI Polygon:", aoi.getInfo())

        # ✅ Load Sentinel-2 Surface Reflectance collection
        collection = (
            ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(aoi)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            .map(mask_clouds)
            .map(lambda img: img.multiply(0.0001))  # Scale reflectance
        )

        # ✅ If no images, return 404
        if collection.size().getInfo() == 0:
            return jsonify({"error": "No Sentinel-2 data available for the specified AOI and dates"}), 404

        # ✅ Compute NDVI
        ndvi_collection = collection.map(calculate_ndvi)
        mean_ndvi = ndvi_collection.mean().select('NDVI')

        # ✅ Clip NDVI to AOI to avoid entire bounding box
        mean_ndvi_clipped = mean_ndvi.clip(aoi)

        # ✅ Generate NDVI tile URL
        # Typical NDVI can range from about -0.2 (bare soil) to 1.0 (dense vegetation).
        # We can use a standard NDVI color palette from red (low) to green (high).
        vis_params = {
            'min': -0.2,     # or 0 if you only want positive NDVI
            'max': 1.0,
            'palette': [
                'blue',       # -0.2 NDVI
                'white',      # 0 NDVI
                'yellow',     # 0.3 NDVI
                'green',      # 0.6 NDVI
                'darkgreen'   # 1.0 NDVI
            ]
        }

        map_dict = mean_ndvi_clipped.getMapId(vis_params)
        tile_url = map_dict['tile_fetcher'].url_format
        print("✅ NDVI Tile URL:", tile_url)

        response = {
            "status": "success",
            "start_date": start_date,
            "end_date": end_date,
            "coordinates": coordinates,
            "tile_url": tile_url
        }
        return jsonify(response), 200

    except ee.EEException as e:
        print("❌ Earth Engine Error:", str(e))
        return jsonify({"error": f"Earth Engine Error: {str(e)}"}), 500
    except Exception as e:
        print("❌ Internal server error:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/ndvi_time_series', methods=['POST'])
def ndvi_time_series():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        coordinates = data.get('coordinates')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        if not coordinates or not start_date or not end_date:
            return jsonify({"error": "Missing required fields"}), 400
        if len(coordinates) < 3:
            return jsonify({"error": "AOI must have at least three coordinates"}), 400

        # ✅ Check if Earth Engine is available
        if not EE_INITIALIZED:
            return jsonify({"error": "Google Earth Engine is not initialized. Please check service account configuration."}), 503

        # Create AOI and apply a small positive buffer or no buffer
        aoi = ee.Geometry.Polygon([coordinates])
        # Use positive buffer or no buffer to avoid geometry issues
        buffered_geom = aoi.buffer(10)  # Small positive buffer instead of negative
        print("✅ Buffered AOI:", buffered_geom.getInfo())

        # Load Sentinel-2 SR collection filtered by the buffered geometry.
        collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                      .filterBounds(buffered_geom)
                      .filterDate(start_date, end_date)
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                      .filter(ee.Filter.notNull(['system:time_start']))
                      .map(mask_clouds)
                     )
        # Scale images and preserve properties.
        def scale_image(image):
            return image.multiply(0.0001).copyProperties(image, ['system:time_start', 'system:index'])
        collection = collection.map(scale_image)

        coll_size = collection.size().getInfo()
        print("Collection size:", coll_size)
        if coll_size == 0:
            return jsonify({"error": "No Sentinel-2 data available for the specified AOI and dates"}), 404

        # Compute NDVI and preserve time property.
        def add_ndvi(image):
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            return image.addBands(ndvi).copyProperties(image, ['system:time_start', 'system:index'])
        ndvi_collection = collection.map(add_ndvi)

        # Mapping function: For each image, compute mean NDVI over the buffered geometry and return a feature with image ID, raw time, formatted date, and NDVI.
        def debug_feature(image):
            time_prop = image.get('system:time_start')
            image_id = image.get('system:index')
            formatted_date = ee.Algorithms.If(
                ee.Algorithms.IsEqual(time_prop, None),
                "null",
                ee.Date(time_prop).format('YYYY-MM-dd')
            )
            ndvi_dict = image.select('NDVI').reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=buffered_geom,
                scale=5,         # Use higher resolution for better accuracy
                bestEffort=True,
                maxPixels=1e9
            )
            ndvi_value = ndvi_dict.get('NDVI')
            return ee.Feature(None, {
                'id': image_id,
                'time_start': time_prop,
                'date': formatted_date,
                'ndvi': ndvi_value
            })

        # Map over the NDVI collection.
        features = ndvi_collection.map(debug_feature, dropNulls=True)
        features = ee.FeatureCollection(features)
        try:
            features_info = features.getInfo()
            print("Mapped features info retrieved successfully.")
        except Exception as inner_error:
            print("❌ Error calling getInfo on features:", inner_error)
            raise

        # Build the time series list from features with valid 'date' and 'ndvi'
        time_series = []
        for f in features_info.get('features', []):
            props = f.get('properties', {})
            if props.get('date') and props.get('ndvi') is not None:
                time_series.append({
                    'date': props.get('date'),
                    'ndvi': props.get('ndvi')
                })

        response = {
            "status": "success",
            "time_series": time_series
        }
        return jsonify(response), 200

    except ee.EEException as e:
        print("❌ Earth Engine Error:", str(e))
        return jsonify({"error": f"Earth Engine Error: {str(e)}"}), 500
    except Exception as e:
        print("❌ Internal server error:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/indices/calculate', methods=['POST'])
def process_index():
    """
    Generic endpoint to calculate any vegetation index and return tile URL for visualization.
    
    Expected JSON payload:
    {
        "coordinates": [[lng, lat], [lng, lat], ...],
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD", 
        "index_name": "NDVI" | "EVI" | "SAVI" | "ARVI" | "MAVI" | "SR"
    }
    """
    try:
        # ✅ Receive request data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        coordinates = data.get('coordinates')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        index_name = data.get('index_name', 'NDVI')  # Default to NDVI

        if not coordinates or not start_date or not end_date:
            return jsonify({"error": "Missing required fields: coordinates, start_date, end_date"}), 400

        if len(coordinates) < 3:
            return jsonify({"error": "AOI must have at least three coordinates"}), 400

        # ✅ Date validation - Sentinel-2 data has ~5 day delay
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            today = datetime.now()
            
            # Check if end date is too recent (less than 5 days ago)
            days_ago = (today - end_dt).days
            if days_ago < 5:
                return jsonify({
                    "error": f"End date is too recent. Satellite data is typically delayed by 4-5 days. Please select a date before {(today - timedelta(days=5)).strftime('%Y-%m-%d')}",
                    "suggested_end_date": (today - timedelta(days=5)).strftime('%Y-%m-%d')
                }), 400
                
            # Check if date range is valid
            if start_dt >= end_dt:
                return jsonify({"error": "Start date must be before end date"}), 400
                
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        # ✅ Check if Earth Engine is available
        if not EE_INITIALIZED:
            return jsonify({"error": "Google Earth Engine is not initialized. Please check service account configuration."}), 503

        # ✅ Create AOI Polygon
        aoi = ee.Geometry.Polygon([coordinates])
        print(f"✅ AOI Polygon for {index_name}:", aoi.getInfo())

        # ✅ Load Sentinel-2 Surface Reflectance collection with all required bands
        collection = (
            ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(aoi)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            .map(mask_clouds)
            .map(lambda img: img.multiply(0.0001))  # Scale reflectance
            .select(['B2', 'B4', 'B8', 'B11'])  # Blue, Red, NIR, SWIR
        )

        # ✅ If no images, return 404
        if collection.size().getInfo() == 0:
            return jsonify({"error": "No Sentinel-2 data available for the specified AOI and dates"}), 404

        # ✅ Get median composite and calculate the selected vegetation index
        median_image = collection.median()
        
        try:
            index_image = calculate_vegetation_index(median_image, index_name)
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400

        # ✅ Clip index to AOI to avoid entire bounding box
        index_clipped = index_image.clip(aoi)

        # ✅ Generate index tile URL with appropriate visualization parameters
        vis_params = get_visualization_params(index_name)
        map_dict = index_clipped.getMapId(vis_params)
        tile_url = map_dict['tile_fetcher'].url_format
        print(f"✅ {index_name} Tile URL:", tile_url)

        response = {
            "status": "success",
            "index_name": index_name,
            "start_date": start_date,
            "end_date": end_date,
            "coordinates": coordinates,
            "tile_url": tile_url,
            "visualization_params": vis_params
        }
        return jsonify(response), 200

    except ee.EEException as e:
        print("❌ Earth Engine Error:", str(e))
        return jsonify({"error": f"Earth Engine Error: {str(e)}"}), 500
    except Exception as e:
        print("❌ Internal server error:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/indices/timeseries', methods=['POST'])
def index_time_series():
    """
    Generic endpoint to calculate time series for any vegetation index.
    
    Expected JSON payload:
    {
        "coordinates": [[lng, lat], [lng, lat], ...],
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "index_name": "NDVI" | "EVI" | "SAVI" | "ARVI" | "MAVI" | "SR"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        coordinates = data.get('coordinates')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        index_name = data.get('index_name', 'NDVI')  # Default to NDVI

        if not coordinates or not start_date or not end_date:
            return jsonify({"error": "Missing required fields: coordinates, start_date, end_date"}), 400
        if len(coordinates) < 3:
            return jsonify({"error": "AOI must have at least three coordinates"}), 400

        # ✅ Date validation - Sentinel-2 data has ~5 day delay
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            today = datetime.now()
            
            # Check if end date is too recent (less than 5 days ago)
            days_ago = (today - end_dt).days
            if days_ago < 5:
                return jsonify({
                    "error": f"End date is too recent. Satellite data is typically delayed by 4-5 days. Please select a date before {(today - timedelta(days=5)).strftime('%Y-%m-%d')}",
                    "suggested_end_date": (today - timedelta(days=5)).strftime('%Y-%m-%d')
                }), 400
                
            # Check if date range is valid
            if start_dt >= end_dt:
                return jsonify({"error": "Start date must be before end date"}), 400
                
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        # ✅ Check if Earth Engine is available
        if not EE_INITIALIZED:
            return jsonify({"error": "Google Earth Engine is not initialized. Please check service account configuration."}), 503

        # Create AOI and apply a small positive buffer
        aoi = ee.Geometry.Polygon([coordinates])
        buffered_geom = aoi.buffer(10)  # Small positive buffer
        print(f"✅ Buffered AOI for {index_name}:", buffered_geom.getInfo())

        # Load Sentinel-2 SR collection with all required bands
        collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                      .filterBounds(buffered_geom)
                      .filterDate(start_date, end_date)
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                      .filter(ee.Filter.notNull(['system:time_start']))
                      .map(mask_clouds)
                      .select(['B2', 'B4', 'B8', 'B11'])  # Blue, Red, NIR, SWIR
                     )
        
        # Scale images and preserve properties
        def scale_image(image):
            return image.multiply(0.0001).copyProperties(image, ['system:time_start', 'system:index'])
        collection = collection.map(scale_image)

        coll_size = collection.size().getInfo()
        print(f"Collection size for {index_name}:", coll_size)
        if coll_size == 0:
            return jsonify({"error": "No Sentinel-2 data available for the specified AOI and dates"}), 404

        # Compute the selected vegetation index for each image
        def add_index(image):
            try:
                index_img = calculate_vegetation_index(image, index_name)
                return image.addBands(index_img).copyProperties(image, ['system:time_start', 'system:index'])
            except:
                return image  # Skip if calculation fails
        
        index_collection = collection.map(add_index)

        # Extract time series data
        def extract_index_feature(image):
            time_prop = image.get('system:time_start')
            image_id = image.get('system:index')
            formatted_date = ee.Algorithms.If(
                ee.Algorithms.IsEqual(time_prop, None),
                "null",
                ee.Date(time_prop).format('YYYY-MM-dd')
            )
            
            # Get the mean value for the selected index
            index_dict = image.select(index_name).reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=buffered_geom,
                scale=5,
                bestEffort=True,
                maxPixels=1e9
            )
            index_value = index_dict.get(index_name)
            
            return ee.Feature(None, {
                'id': image_id,
                'time_start': time_prop,
                'date': formatted_date,
                'index_name': index_name,
                'value': index_value
            })

        # Map over the collection
        features = index_collection.map(extract_index_feature, dropNulls=True)
        features = ee.FeatureCollection(features)
        
        try:
            features_info = features.getInfo()
            print(f"Mapped features info for {index_name} retrieved successfully.")
        except Exception as inner_error:
            print(f"❌ Error calling getInfo on {index_name} features:", inner_error)
            raise

        # Build the time series list
        time_series = []
        for f in features_info.get('features', []):
            props = f.get('properties', {})
            if props.get('date') and props.get('value') is not None:
                time_series.append({
                    'date': props.get('date'),
                    'value': props.get('value'),
                    'index_name': index_name
                })

        response = {
            "status": "success",
            "index_name": index_name,
            "time_series": time_series,
            "total_measurements": len(time_series)
        }
        return jsonify(response), 200

    except ee.EEException as e:
        print("❌ Earth Engine Error:", str(e))
        return jsonify({"error": f"Earth Engine Error: {str(e)}"}), 500
    except Exception as e:
        print("❌ Internal server error:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/api/indices/list', methods=['GET'])
def list_indices():
    """
    Return a list of available vegetation indices with their descriptions.
    """
    indices = {
        'NDVI': {
            'name': 'Normalized Difference Vegetation Index',
            'formula': '(NIR - Red) / (NIR + Red)',
            'description': 'Most common vegetation index, good for general vegetation health assessment',
            'range': [-1, 1],
            'optimal_range': [0.4, 0.7]
        },
        'EVI': {
            'name': 'Enhanced Vegetation Index', 
            'formula': '2.5 * ((NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1))',
            'description': 'Improved version of NDVI with atmospheric correction and reduced soil noise',
            'range': [-1, 1],
            'optimal_range': [0.3, 0.8]
        },
        'SAVI': {
            'name': 'Soil-Adjusted Vegetation Index',
            'formula': '((NIR - Red) / (NIR + Red + 0.5)) * 1.5',
            'description': 'Reduces soil brightness influence, good for sparse vegetation',
            'range': [-1, 1],
            'optimal_range': [0.2, 0.6]
        },
        'ARVI': {
            'name': 'Atmospherically Resistant Vegetation Index',
            'formula': '(NIR - (2*Red - Blue)) / (NIR + (2*Red - Blue))',
            'description': 'Reduces atmospheric effects, especially aerosol scattering',
            'range': [-1, 1],
            'optimal_range': [0.3, 0.7]
        },
        'MAVI': {
            'name': 'Moisture-Adjusted Vegetation Index',
            'formula': '(NIR - Red) / (NIR + Red + SWIR)',
            'description': 'Incorporates moisture information from SWIR band',
            'range': [-1, 1],
            'optimal_range': [0.2, 0.6]
        },
        'SR': {
            'name': 'Simple Ratio',
            'formula': 'NIR / Red', 
            'description': 'Basic ratio of NIR to Red, simple but effective',
            'range': [0, 10],
            'optimal_range': [2, 8]
        }
    }
    
    return jsonify({
        "status": "success",
        "indices": indices,
        "total_count": len(indices)
    })

@app.route('/api/crop-recommendations', methods=['POST'])
def get_ai_crop_recommendations():
    """
    Generate AI-powered crop recommendations based on field data, weather, and vegetation indices.
    
    Expected JSON payload:
    {
        "field_data": {
            "location": "Maharashtra, India",
            "area": 2.5,
            "soil_type": "Black Cotton Soil",
            "soil_ph": 7.2,
            "irrigation": "Drip irrigation",
            "experience": "5 years",
            "budget": "Rs. 50,000"
        },
        "weather_data": {
            "avg_temp": 28,
            "rainfall": 650,
            "humidity": 75,
            "pattern": "Normal monsoon expected"
        },
        "vegetation_data": {
            "ndvi": 0.65,
            "soil_health": "Good",
            "prev_performance": "Above average"
        }
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400
            
        field_data = data.get('field_data', {})
        weather_data = data.get('weather_data')
        vegetation_data = data.get('vegetation_data')
        
        if not field_data:
            return jsonify({"error": "Field data is required"}), 400
            
        # Generate AI recommendations
        if AI_SERVICE_AVAILABLE:
            recommendations = generate_ai_crop_recommendations(
                field_data=field_data,
                weather_data=weather_data,
                vegetation_data=vegetation_data
            )
        else:
            recommendations = get_fallback_recommendations()
            
        return jsonify(recommendations), 200
        
    except Exception as e:
        print(f"❌ Error generating crop recommendations: {e}")
        return jsonify({
            "error": f"Failed to generate recommendations: {str(e)}",
            "fallback": get_fallback_recommendations()
        }), 500

@app.route('/debug/auth', methods=['GET'])
def debug_auth():
    """Debug endpoint to check authentication status"""
    service_account_key = os.getenv('GOOGLE_SERVICE_ACCOUNT_KEY')
    
    debug_info = {
        "earth_engine_initialized": EE_INITIALIZED,
        "service_account_key_present": bool(service_account_key),
        "service_account_key_length": len(service_account_key) if service_account_key else 0,
    }
    
    if service_account_key:
        try:
            service_account_info = json.loads(service_account_key)
            debug_info.update({
                "service_account_email": service_account_info.get('client_email', 'N/A'),
                "project_id_from_key": service_account_info.get('project_id', 'N/A'),
                "key_type": service_account_info.get('type', 'N/A'),
                "key_has_private_key": 'private_key' in service_account_info
            })
        except Exception as e:
            debug_info["service_account_parse_error"] = str(e)
    
    return jsonify(debug_info)

@app.route('/api/debug/ndvi-stats/<float:lat>/<float:lng>', methods=['GET'])
def debug_ndvi_stats(lat, lng):
    """Debug endpoint to analyze NDVI statistics for a point"""
    try:
        # Initialize Earth Engine if not already done
        if not hasattr(app, 'ee_initialized'):
            initialize_ee()
        
        # Create point geometry with buffer
        point = ee.Geometry.Point([lng, lat])
        aoi = point.buffer(100)  # 100m buffer for analysis
        
        # Get recent date range
        end_date = ee.Date(datetime.now().strftime('%Y-%m-%d'))
        start_date = end_date.advance(-30, 'day')
        
        # Get Sentinel-2 collection
        collection = ee.ImageCollection('COPERNICUS/S2_SR') \
                      .filterBounds(aoi) \
                      .filterDate(start_date, end_date) \
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        
        # Calculate NDVI for most recent image
        def calculate_ndvi_stats(image):
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            
            # Get various statistics
            stats = ndvi.reduceRegion(
                reducer=ee.Reducer.minMax().combine(
                    ee.Reducer.mean(), sharedInputs=True
                ).combine(
                    ee.Reducer.stdDev(), sharedInputs=True
                ).combine(
                    ee.Reducer.percentile([10, 25, 50, 75, 90]), sharedInputs=True
                ),
                geometry=aoi,
                scale=10,
                maxPixels=1e9
            )
            
            return {
                'date': image.date().format('YYYY-MM-dd').getInfo(),
                'stats': stats.getInfo()
            }
        
        # Get collection info
        collection_size = collection.size().getInfo()
        
        if collection_size == 0:
            return jsonify({
                'error': 'No Sentinel-2 images found for this location and date range',
                'location': {'lat': lat, 'lng': lng},
                'date_range': {
                    'start': start_date.format('YYYY-MM-dd').getInfo(),
                    'end': end_date.format('YYYY-MM-dd').getInfo()
                }
            })
        
        # Get stats for the most recent image
        most_recent = collection.sort('system:time_start', False).first()
        ndvi_stats = calculate_ndvi_stats(most_recent)
        
        return jsonify({
            'location': {'lat': lat, 'lng': lng},
            'date_range': {
                'start': start_date.format('YYYY-MM-dd').getInfo(),
                'end': end_date.format('YYYY-MM-dd').getInfo()
            },
            'collection_size': collection_size,
            'most_recent_image': ndvi_stats,
            'analysis': {
                'note': 'Healthy vegetation typically shows NDVI values between 0.4-0.7',
                'interpretation': 'Values below 0.3 may indicate stressed vegetation, bare soil, or water'
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
