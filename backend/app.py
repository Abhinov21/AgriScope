import ee
import json
import time
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

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

        # Create AOI and apply a negative buffer (-20 m)
        aoi = ee.Geometry.Polygon([coordinates])
        buffered_geom = aoi.buffer(-20)
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
                scale=10,         # adjust scale if needed
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

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AgriScope Flask Backend",
        "earth_engine_status": "initialized" if EE_INITIALIZED else "not_available",
        "message": "AgriScope backend is running successfully!"
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "earth_engine": EE_INITIALIZED,
        "timestamp": time.time()
    })

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

if __name__ == '__main__':
    app.run(port=5000, debug=True)
