# AgriScope - AI-Powered Agricultural Intelligence Platform

A comprehensive agricultural monitoring and management platform that leverages **artificial intelligence**, **satellite data**, **weather analytics**, and **field management tools** to help farmers optimize crop management with intelligent, market-aware recommendations.

## 🌾 Project Overview

AgriScope combines **AI-powered crop recommendations**, **satellite imagery analysis**, **real-time weather monitoring**, and **field management** into a unified intelligence platform. The application uses **Google Gemini AI** for intelligent crop suggestions, **Google Earth Engine** for vegetation indices calculations, **NASA's weather APIs** for meteorological data, and interactive mapping for comprehensive field analysis.

## 🤖 NEW: AI-Powered Crop Recommendation System

### Revolutionary Features
- **🧠 Descriptive AI Analysis**: Powered by Google Gemini AI for intelligent, context-aware recommendations
- **📊 Market Intelligence**: Real-time market trends and profitability analysis
- **🌍 Land Assessment**: Comprehensive soil, irrigation, and field condition analysis
- **�️ Season Optimization**: Season-specific crop recommendations with optimal planting windows
- **💰 Profit Maximization**: Market-aware suggestions for maximum profitability
- **📋 Action Plans**: Step-by-step implementation guidance
- **♻️ Sustainability Focus**: Long-term soil health and eco-friendly practices

### How AI Recommendations Work
1. **Data Collection**: Users input field details (location, soil type, irrigation, budget, experience)
2. **AI Processing**: Google Gemini AI analyzes field conditions, market trends, and seasonal factors
3. **Intelligent Output**: Comprehensive analysis including:
   - Land suitability assessment
   - Season-specific recommendations
   - Market insights and profit potential
   - Detailed crop suggestions with growing tips
   - Implementation timeline and action plans
   - Sustainability advice for long-term success

## 🏗️ Architecture

### Backend Services
- **🐍 Python Flask Server** (Port 5000): 
  - AI crop recommendations using Google Gemini
  - Google Earth Engine integration for satellite data processing
  - Agricultural indices calculation (NDVI, EVI, SAVI, NDWI)
- **🟢 Node.js/Express Server**: Authentication, field management, weather data
- **🗄️ MySQL Database**: User data, field boundaries, and historical analysis

### Frontend
- **⚛️ React Application** (Port 3001): Modern AI-focused UI with intelligent recommendations
- **🗺️ Leaflet Maps**: Interactive field drawing and vegetation visualization
- **📈 Chart.js**: Advanced time-series data visualization for indices and weather trends

## ✨ Key Features

### 1. **🤖 AI-Powered Crop Intelligence** (NEW)
- **Descriptive Analysis**: Comprehensive land, season, and market analysis
- **Smart Recommendations**: 3 detailed crop options with variety suggestions
- **Market Integration**: Real-time market trends and profitability insights
- **Personalized Advice**: Tailored to farmer experience, budget, and field conditions
- **Implementation Guidance**: Step-by-step action plans and timelines
- **Risk Assessment**: Potential challenges and mitigation strategies

### 2. **📊 Advanced Agricultural Indices Analysis**
- **NDVI (Normalized Difference Vegetation Index)**
  - **Purpose**: Primary vegetation health indicator
  - **Formula**: (NIR - Red) / (NIR + Red)
  - **Range**: -1 to +1 (higher values = healthier vegetation)
  - **Applications**: Crop monitoring, yield prediction, stress detection
  
- **EVI (Enhanced Vegetation Index)**
  - **Purpose**: Improved vegetation monitoring with reduced atmospheric interference
  - **Formula**: 2.5 × ((NIR - Red) / (NIR + 6×Red - 7.5×Blue + 1))
  - **Advantages**: Better performance in dense vegetation areas
  - **Applications**: Dense canopy analysis, tropical vegetation monitoring
  
- **SAVI (Soil Adjusted Vegetation Index)**
  - **Purpose**: Vegetation analysis accounting for soil background effects
  - **Formula**: ((NIR - Red) / (NIR + Red + L)) × (1 + L), where L = 0.5
  - **Applications**: Sparse vegetation monitoring, early growth stage analysis
  - **Benefits**: Reduces soil brightness influence on measurements
  
- **NDWI (Normalized Difference Water Index)**
  - **Purpose**: Water content and moisture stress detection
  - **Formula**: (Green - NIR) / (Green + NIR)
  - **Applications**: Irrigation management, drought monitoring, water stress detection
  - **Critical for**: Optimizing irrigation timing and water resource management

### 3. **Field Management System**
- Interactive map-based field boundary drawing
- Save/load/delete field polygons with AI analysis integration
- User-specific field data storage with historical AI recommendations

### 4. **🛰️ Advanced Satellite Data Processing**
- Real-time satellite data processing using Sentinel-2 imagery
- Multi-spectral analysis for comprehensive vegetation assessment
- Cloud masking and atmospheric correction for data quality
- Time-series analysis with multiple vegetation indices
- Visual overlays with color-coded health indicators

### 5. **🌦️ Weather Intelligence**
- NASA POWER API integration for comprehensive meteorological data
- Temperature, precipitation, humidity, and solar radiation tracking
- Historical weather pattern analysis and seasonal predictions
- Weather-based crop recommendations and risk assessment

### 6. **👤 User Authentication & Personalization**
- JWT-based secure authentication system
- Personalized AI recommendations based on user profile
- Historical data tracking and improvement suggestions
- User-specific field analysis and progress monitoring

### 7. **📊 Advanced Data Visualization**
- Interactive charts for multiple vegetation indices time-series
- Comparative analysis between different agricultural indices
- Weather data trends and correlation analysis
- Real-time field condition monitoring with AI insights
- Market trend visualization and profit projections

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MySQL Server
- Google Earth Engine account
- **NEW**: Google Gemini API key for AI recommendations

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Abhinov21/AgriScope.git
cd AgriScope
```

2. **Backend Setup**
```bash
cd backend
npm install
pip install -r requirements.txt
# Set up environment variables in .env file
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agriscope

# Authentication
JWT_SECRET=your_jwt_secret

# AI Services (NEW)
GEMINI_API_KEY=your_google_gemini_api_key

# Google Earth Engine (for satellite data)
GOOGLE_SERVICE_ACCOUNT_KEY=your_gee_service_account_json
```

4. **Start Backend Services**
```bash
# Start Flask server (AI recommendations + satellite data)
python app.py  # Runs on port 5000

# In another terminal, start Node.js server (if needed for additional services)
node server.js
```

5. **Frontend Setup**
```bash
cd frontend
npm install
npm start  # React app on port 3001
```

## 🛠️ Technology Stack

### Backend Technologies
- **🐍 Python Flask**: AI processing and satellite data analysis
  - Google Gemini AI for intelligent crop recommendations
  - Google Earth Engine for satellite imagery processing
  - Agricultural indices calculation (NDVI, EVI, SAVI, NDWI)
- **🟢 Node.js/Express**: Authentication and field management
- **🗄️ MySQL**: Persistent data storage
- **🔒 JWT**: Secure authentication
- **🛡️ bcrypt**: Password security

### AI & Machine Learning
- **Google Gemini AI**: Advanced language model for crop recommendations
- **Google Earth Engine**: Satellite data processing and analysis
- **Sentinel-2 Imagery**: High-resolution agricultural monitoring
- **NASA POWER API**: Comprehensive weather data integration

### Frontend Technologies
- **⚛️ React (v19)**: Modern component-based UI
- **🗺️ Leaflet + React-Leaflet**: Interactive mapping and field visualization
- **📈 Chart.js + React-Chart.js-2**: Advanced data visualization
- **🌐 Axios**: API communication
- **🎨 Modern CSS**: Responsive, AI-focused design

### External APIs & Services
- **🤖 Google Gemini AI**: Intelligent crop recommendation generation
- **🛰️ Google Earth Engine**: Satellite imagery and agricultural indices
- **🌦️ NASA POWER API**: Meteorological data and weather analytics
- **📡 Sentinel-2**: High-resolution satellite imagery

## 📊 Agricultural Indices Explained

### Understanding Vegetation Health Indicators

#### 🌱 NDVI (Normalized Difference Vegetation Index)
- **Purpose**: Primary indicator of vegetation health and photosynthetic activity
- **How it works**: Measures difference between near-infrared and red light reflection
- **Values**: 
  - < 0.2: Bare soil, rocks, water
  - 0.2-0.4: Sparse vegetation, stressed crops
  - 0.4-0.7: Moderate to dense vegetation
  - > 0.7: Very dense, healthy vegetation
- **Applications**: 
  - Crop health monitoring
  - Yield prediction
  - Irrigation scheduling
  - Pest/disease early detection

#### 🌿 EVI (Enhanced Vegetation Index)
- **Purpose**: Improved vegetation monitoring with better sensitivity in dense canopies
- **Advantages over NDVI**:
  - Reduced atmospheric interference
  - Better performance in high biomass areas
  - Less saturation in dense vegetation
- **Applications**:
  - Dense crop monitoring (sugarcane, forest crops)
  - Tropical agriculture analysis
  - Biomass estimation

#### 🏜️ SAVI (Soil Adjusted Vegetation Index)
- **Purpose**: Vegetation analysis that accounts for soil background effects
- **When to use**: 
  - Sparse vegetation coverage
  - Early crop growth stages
  - Arid and semi-arid regions
- **Benefits**:
  - Reduces soil brightness influence
  - More accurate in low vegetation coverage
  - Better for precision agriculture applications

#### 💧 NDWI (Normalized Difference Water Index)
- **Purpose**: Water content and moisture stress detection in vegetation
- **Critical for**:
  - Irrigation optimization
  - Drought stress monitoring
  - Water resource management
  - Crop water requirements assessment
- **Applications**:
  - Determining irrigation timing
  - Monitoring water stress
  - Flood impact assessment

### How Indices Work Together
1. **NDVI + EVI**: Comprehensive vegetation health assessment
2. **SAVI + NDVI**: Accurate monitoring from seedling to maturity
3. **NDWI + NDVI**: Health monitoring with water stress detection
4. **All indices combined**: Complete agricultural intelligence for AI recommendations

## 🤖 AI Recommendation Engine

### How the AI Analyzes Your Field

#### 📝 Input Processing
The AI considers multiple factors:
- **📍 Location**: Climate zone, regional crop patterns, local market conditions
- **🌾 Field Characteristics**: Size, soil type, pH, irrigation facilities
- **👨‍🌾 Farmer Profile**: Experience level, budget constraints, previous crops
- **🛰️ Satellite Data**: Current vegetation indices and field health
- **🌦️ Weather Patterns**: Historical and predicted weather conditions

#### 🧠 AI Analysis Process
1. **Contextual Understanding**: AI interprets current season, regional conditions
2. **Market Intelligence**: Real-time analysis of crop demand and pricing
3. **Risk Assessment**: Evaluation of potential challenges and mitigation strategies
4. **Optimization**: Recommendations for maximum profitability and sustainability

#### 📊 Output Structure
- **🌍 Land Analysis**: Soil assessment, water requirements, field opportunities
- **🌤️ Season Analysis**: Current season suitability, optimal planting windows
- **📈 Market Insights**: Price trends, demand analysis, profit potential
- **🌾 Crop Recommendations**: 3 detailed options with varieties and growing tips
- **📋 Action Plans**: Step-by-step implementation timeline
- **♻️ Sustainability Advice**: Long-term soil health and environmental practices

## 📊 Core Functionalities

### 🤖 AI Crop Recommendation Workflow (NEW)
1. **Data Input**: User provides field details, soil information, budget, and experience
2. **AI Processing**: Google Gemini AI analyzes multiple factors:
   - Field characteristics and soil conditions
   - Current season and weather patterns
   - Regional market trends and crop prices
   - Historical agricultural data
3. **Intelligent Analysis**: AI generates comprehensive recommendations including:
   - Land suitability assessment
   - Season-specific advice
   - Market intelligence and profit projections
   - Detailed crop suggestions with growing guidelines
4. **Actionable Output**: Users receive step-by-step implementation plans and sustainability advice

### 🛰️ Advanced Satellite Data Processing Workflow
1. User draws field boundary on interactive map
2. Coordinates sent to Python Flask server with AI integration
3. Google Earth Engine processes multi-spectral Sentinel-2 imagery
4. Multiple agricultural indices calculated (NDVI, EVI, SAVI, NDWI)
5. Cloud masking and atmospheric correction applied
6. AI correlates satellite data with crop recommendations
7. Results displayed as interactive visualizations and integrated into AI analysis

### 🌦️ Weather Intelligence Integration
1. Field coordinates determine precise meteorological analysis points
2. NASA POWER API provides comprehensive weather data
3. Historical patterns analyzed for seasonal recommendations
4. Weather data integrated into AI crop selection process
5. Climate risk assessment included in recommendations

## 🔧 Available Scripts

### Backend Services
```bash
# Start AI-powered Flask server (Recommended)
python app.py  # Port 5000 - AI recommendations + satellite data

# Optional: Node.js server for additional services
node server.js  # Port 5000 - Authentication and field management
```

### Frontend Development
```bash
# Development mode
npm start  # Port 3001 - React development server

# Production build
npm run build  # Optimized production build

# Testing
npm test  # Interactive test runner
```

## 🌐 API Endpoints

### 🤖 AI Crop Recommendations (NEW)
- `POST /api/crop-recommendations` - Generate AI-powered crop recommendations
  ```json
  {
    "field_data": {
      "location": "Punjab, India",
      "area": "2.5",
      "soil_type": "loamy",
      "irrigation": "drip",
      "budget": "medium",
      "experience": "intermediate"
    },
    "weather_data": null,
    "vegetation_data": null
  }
  ```

### 🛰️ Satellite Data & Agricultural Indices
- `POST /process_ndvi` - Calculate NDVI for field coordinates
- `POST /process_evi` - Calculate Enhanced Vegetation Index
- `POST /process_savi` - Calculate Soil Adjusted Vegetation Index
- `POST /process_ndwi` - Calculate Normalized Difference Water Index
- `POST /ndvi_time_series` - Get time-series data for vegetation indices
- `POST /multi_index_analysis` - Comprehensive multi-index analysis

### 👤 Authentication & User Management
- `POST /auth/register` - User registration with profile creation
- `POST /auth/login` - Secure user authentication
- `GET /user/profile` - Get user profile and preferences
- `PUT /user/profile` - Update user preferences for AI recommendations

### 🗺️ Field Management
- `GET /api/fields?email=user@example.com` - Get user's fields with AI history
- `POST /api/fields` - Save new field with initial AI analysis
- `PUT /api/fields/:id` - Update field with new AI recommendations
- `DELETE /api/fields/:id` - Delete field and associated AI data

### 🌦️ Weather Intelligence
- `POST /api/weather/data` - Comprehensive weather data for coordinates
- `POST /api/weather/forecast` - Weather forecast integration with AI recommendations
- `POST /api/weather/historical` - Historical weather pattern analysis

## 📱 Enhanced User Interface

### 🔝 Main Pages
1. **🔐 Login/Register**: Secure authentication with user profiling
2. **🏠 Dashboard**: AI-powered insights and field overview with key metrics
3. **🔍 Monitor Field**: Advanced field analysis with multiple vegetation indices
4. **📊 Field Reports**: Comprehensive analysis with AI-enhanced insights
5. **🤖 AI Crop Suggestions**: Revolutionary AI-powered crop recommendation system
6. **📝 Smart Requirements**: Intelligent form for personalized AI analysis

### 🧩 Advanced Components
- **🗺️ Intelligent Map Interface**: Field boundary drawing with AI integration
- **📈 Multi-Index Charts**: Comprehensive vegetation health visualization (NDVI, EVI, SAVI, NDWI)
- **🌦️ Weather Intelligence Panel**: Advanced meteorological data with AI correlation
- **🤖 AI Recommendation Cards**: Beautiful, informative crop suggestion displays
- **📊 Market Intelligence Dashboard**: Real-time market trends and profit analysis
- **⏰ Smart Date Picker**: AI-optimized time period selection for analysis
- **📋 Action Plan Timeline**: Step-by-step implementation guidance

## 🔒 Enhanced Security Features

- **🔐 JWT Authentication**: Secure token-based user management
- **🛡️ Advanced Password Security**: bcrypt hashing with salt
- **🚧 API Route Protection**: Middleware-based authentication for all endpoints
- **✅ Input Validation**: Comprehensive data sanitization and validation
- **🌐 CORS Security**: Configured cross-origin request handling
- **🤖 AI Rate Limiting**: Controlled access to AI recommendation services
- **📊 Audit Logging**: Track AI recommendation usage and field analysis history

## 🚀 Latest Enhancements & Future Roadmap

### ✅ Recently Implemented
- **🤖 AI-Powered Crop Recommendations**: Complete system overhaul with Google Gemini integration
- **📊 Multiple Agricultural Indices**: NDVI, EVI, SAVI, NDWI comprehensive analysis
- **📈 Market Intelligence**: Real-time market trend integration
- **🎨 Modern UI/UX**: AI-focused interface design with enhanced user experience
- **♻️ Sustainability Focus**: Environmental and long-term soil health recommendations

### 🔮 Future Enhancements
- **📱 Mobile Application**: Native iOS and Android apps with offline AI capabilities
- **🤖 Advanced ML Models**: Custom machine learning models for yield prediction
- **🌐 IoT Integration**: Real-time sensor data integration with AI recommendations
- **📊 Blockchain Integration**: Transparent crop tracking and supply chain management
- **🛰️ Real-time Satellite Monitoring**: Live field condition updates with AI alerts
- **🤝 Community Features**: Farmer collaboration platform with AI-mediated knowledge sharing
- **💰 Financial Integration**: Crop insurance and financing recommendations
- **🌍 Global Expansion**: Multi-language support and region-specific AI models

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

Project Link: [https://github.com/Abhinov21/AgriScope](https://github.com/Abhinov21/AgriScope)
