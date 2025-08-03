import requests
import json

# Test the new vegetation indices API
print("🧪 Testing New Vegetation Indices API...")

# Test 1: List available indices
try:
    response = requests.get("http://127.0.0.1:5000/api/indices/list")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Available indices: {list(data['indices'].keys())}")
        print(f"📊 Total count: {data['total_count']}")
    else:
        print(f"❌ Error listing indices: {response.status_code}")
except Exception as e:
    print(f"❌ Connection error: {e}")

# Test 2: Calculate EVI for Iowa agricultural area
test_coordinates = [
    [-93.098, 41.878],
    [-93.088, 41.878], 
    [-93.088, 41.888],
    [-93.098, 41.888],
    [-93.098, 41.878]
]

test_data = {
    "coordinates": test_coordinates,
    "start_date": "2025-06-01",
    "end_date": "2025-07-31",
    "index_name": "EVI"
}

print(f"\n🧪 Testing EVI calculation...")
print(f"📍 Location: Iowa agricultural area")
print(f"📅 Date range: {test_data['start_date']} to {test_data['end_date']}")

try:
    response = requests.post(
        "http://127.0.0.1:5000/api/indices/calculate",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ EVI overlay generated successfully!")
        print(f"📊 Index: {result['index_name']}")
        print(f"🗺️ Tile URL: {result['tile_url'][:100]}...")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: SAVI time series
test_data['index_name'] = "SAVI"
print(f"\n🧪 Testing SAVI time series...")

try:
    response = requests.post(
        "http://127.0.0.1:5000/api/indices/timeseries",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ SAVI time series generated successfully!")
        print(f"📊 Index: {result['index_name']}")
        print(f"📈 Measurements: {result['total_measurements']}")
        
        if result['time_series']:
            recent_values = result['time_series'][-3:]
            print(f"📅 Recent values:")
            for item in recent_values:
                print(f"   {item['date']}: {item['value']:.3f}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print(f"\n🎯 All tests completed!")
