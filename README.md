# AgriScope - Agricultural Monitoring Platform

A comprehensive agricultural monitoring and management platform that leverages satellite data, weather analytics, and field management tools to help farmers optimize crop management and monitor field conditions.

## 🌾 Project Overview

AgriScope combines **satellite imagery analysis**, **real-time weather monitoring**, and **field management** into a unified platform. The application uses Google Earth Engine for NDVI (Normalized Difference Vegetation Index) calculations, NASA's weather APIs for meteorological data, and interactive mapping for field boundary management.

## 🏗️ Architecture

### Backend Services
- **Node.js/Express Server** (Port 5000): Authentication, field management, weather data
- **Python Flask Server** (Port 5000): Google Earth Engine integration for satellite data processing
- **MySQL Database**: User data, field boundaries, and plot information

### Frontend
- **React Application** (Port 3000): Interactive UI with mapping, charts, and data visualization
- **Leaflet Maps**: Interactive field drawing and NDVI visualization
- **Chart.js**: Time-series data visualization for NDVI and weather trends

## ✨ Key Features

### 1. **Field Management System**
- Interactive map-based field boundary drawing
- Save/load/delete field polygons
- User-specific field data storage

### 2. **NDVI Analysis**
- Real-time satellite data processing using Sentinel-2 imagery
- Cloud masking for data quality assurance
- Time-series NDVI analysis with interactive charts
- Visual NDVI overlays on maps with color-coded vegetation health

### 3. **Weather Monitoring**
- NASA POWER API integration for meteorological data
- Temperature, precipitation, humidity, and solar radiation tracking
- Historical weather data analysis and visualization

### 4. **Smart Crop Recommendations**
- AI-powered crop suggestion system based on multiple parameters
- Integration of field analysis data (NDVI, weather patterns)
- User requirement assessment (budget, soil type, irrigation, experience)
- Comprehensive crop database with pros/cons analysis
- Seasonal compatibility and profitability scoring
- Field-specific recommendations using satellite data

### 5. **User Authentication**
- JWT-based secure authentication system
- User registration and login functionality
- Protected routes and user-specific data access

### 6. **Data Visualization**
- Interactive charts for NDVI time-series analysis
- Weather data trends and patterns
- Real-time field condition monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MySQL Server
- Google Earth Engine account

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
# Set up environment variables in .env file
npm start  # Node.js server on port 5000
```

3. **Python Service Setup**
```bash
pip install flask flask-cors google-earthengine-api
python app.py  # Flask server for satellite data processing
```

4. **Frontend Setup**
```bash
cd frontend
npm install
npm start  # React app on port 3000
```

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agriscope
JWT_SECRET=your_jwt_secret
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **Python Flask** for Google Earth Engine integration
- **MySQL** for data persistence
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React** (v19) with functional components and hooks
- **React Router** for navigation
- **Leaflet** with React-Leaflet for interactive mapping
- **Chart.js** with React-Chart.js-2 for data visualization
- **Axios** for API communication

### External APIs & Services
- **Google Earth Engine** for satellite imagery and NDVI calculations
- **NASA POWER API** for weather data
- **Sentinel-2** satellite imagery for vegetation analysis

## 📊 Core Functionalities

### NDVI Processing Workflow
1. User draws field boundary on interactive map
2. Coordinates sent to Python Flask server
3. Google Earth Engine processes Sentinel-2 imagery
4. Cloud masking and NDVI calculation performed
5. Results returned as tile layers and time-series data
6. Frontend displays visual overlays and charts

### Weather Data Integration
1. Field coordinates used to determine center point
2. NASA POWER API queried for meteorological data
3. Historical weather patterns analyzed and visualized
4. Data integrated with field-specific analysis

## 🔧 Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`
Builds the app for production to the `build` folder.\
Optimizes the build for the best performance.

### `npm test`
Launches the test runner in the interactive watch mode.

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Field Management
- `GET /api/fields?email=user@example.com` - Get user's fields
- `POST /api/fields` - Save new field
- `PUT /api/fields/:id` - Update field name
- `DELETE /api/fields/:id` - Delete field

### Satellite Data
- `POST /process_ndvi` - Process NDVI for field coordinates
- `POST /ndvi_time_series` - Get NDVI time-series data

### Weather Data
- `POST /api/weather/data` - Get weather data for coordinates

## 📱 User Interface

### Pages
1. **Login/Register**: Secure user authentication
2. **Homepage**: Dashboard with field overview and key metrics
3. **Monitor Field**: Core functionality for field analysis and NDVI processing
4. **Field Reports**: Comprehensive 6-month analysis with advanced insights
5. **Crop Suggestions**: AI-powered crop recommendations based on field analysis and user requirements
6. **Requirements Form**: User input collection for personalized crop suggestions

### Components
- **Interactive Map**: Field boundary drawing and visualization
- **NDVI Time-Series Chart**: Vegetation health trends over time
- **Weather Charts**: Temperature, precipitation, and climate data
- **Field List**: Manage saved field boundaries
- **Date Range Picker**: Select analysis time periods

## 🔒 Security Features

- JWT-based authentication with secure token management
- Password hashing using bcrypt
- Protected API routes with middleware authentication
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## 🚀 Future Enhancements

- Real-time field monitoring with IoT sensor integration
- Machine learning-based crop yield prediction
- Mobile application development
- Advanced agricultural analytics and reporting
- Integration with farming equipment and irrigation systems

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
