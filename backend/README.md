# GreenMiles Backend

A FastAPI-based backend API for the GreenMiles EV (Electric Vehicle) platform. This service provides AI-powered battery health predictions, route optimization, charging station data, and EV profile management for electric vehicle users.

## 🚀 Features

- **Battery Health Prediction**: ML-powered predictions for EV battery status and health
- **Route Optimization**: Calculate optimal routes based on battery consumption
- **Charging Station Locator**: Integration with Mapbox for charging station data
- **EV Profile Management**: CRUD operations for EV vehicle profiles
- **Route Analysis**: Comprehensive route analysis with distance, time, and energy calculations
- **Sustainability Metrics**: Environmental impact tracking and reporting
- **CORS Support**: Pre-configured for frontend integration

## 📋 Prerequisites

- **Python**: v3.12 or higher
- **pip**: v24 or higher (or poetry/conda)
- **SQLite**: Included with Python (for local database)
- **Mapbox Access Token**: Required for charging station features
- **ML Model**: Pre-trained battery prediction model (`ML_Models/ev_battery_model.pkl`)

## 🔧 Installation

### 1. Create Virtual Environment

```bash
# Using venv
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

Or if using pyproject.toml:

```bash
pip install -e .
```

### 3. Environment Configuration

Create a `.env` file in the backend root directory:

```env
# Database
DATABASE_URL=sqlite:///./ev_app.db

# Mapbox
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### 4. Verify Installation

```bash
pip list
```

Ensure all packages from `requirements.txt` are installed.

## 🏃 Running the Application

### Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Base URL**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

### Run with Custom Settings

```bash
# Different port
uvicorn app.main:app --reload --port 8001

# Production mode (no reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📁 Project Structure

```
app/
├── __init__.py
├── main.py              # FastAPI application setup with middleware
├── api/
│   └── v1/
│       └── endpoints/
│           ├── __init__.py
│           └── prediction.py     # Prediction and profile endpoints
├── core/
│   ├── __init__.py
│   ├── config.py        # Configuration settings
│   └── database.py      # Database initialization and operations
├── models/
│   ├── __init__.py
│   ├── schema.py        # Pydantic models for battery and route data
│   └── profile_schema.py # EV profile data models
├── services/
│   ├── __init__.py
│   └── prediction_service.py  # Business logic for predictions
└── utils/
    ├── __init__.py
    └── model_loader.py   # ML model loading utilities
ML_Models/
├── ev_battery_model.pkl  # Pre-trained ML model
```

## 📡 API Endpoints

### Battery Prediction

#### POST `/api/v1/predict`
Predict EV battery health based on vehicle and usage parameters.

**Request Body**:
```json
{
  "Internal_Resistance_Ohm": 0.05,
  "Total_Charging_Cycles": 150,
  "Battery_Capacity_kWh": 82.0,
  "Fast_Charge_Ratio": 0.3,
  "Avg_Temperature_C": 25,
  "Vehicle_Age_Months": 24,
  "Avg_Discharge_Rate_C": 0.5,
  "SoH_Percent": 95.5,
  "Car_Model_Tesla_Model_3": 1,
  "Battery_Type_NMC": 1,
  "Driving_Style_Moderate": 1,
  "Battery_Status_Replace_Required": 0,
  "Vehicle_Weight_kg": 1600,
  "Drag_Coefficient": 0.24,
  "Frontal_Area_m2": 2.2,
  "Rolling_Resistance_Coeff": 0.015,
  "Motor_Efficiency": 0.92
}
```

**Response**:
```json
{
  "prediction": 85.5,
  "vehicle_id": "test_vehicle_2",
  "timestamp": "2026-02-18T10:30:00"
}
```

### EV Profile Management

#### POST `/api/v1/profiles`
Create a new EV profile.

#### GET `/api/v1/profiles/{profile_id}`
Retrieve an EV profile by ID.

#### PUT `/api/v1/profiles/{profile_id}`
Update an EV profile.

#### DELETE `/api/v1/profiles/{profile_id}`
Delete an EV profile.

### Route Analysis

#### POST `/api/v1/route/analyze`
Analyze a route for battery consumption and charging requirements.

### Charging Stations

#### GET `/api/v1/charging-stations`
Get nearby charging stations (requires Mapbox integration).

## 🧠 Machine Learning Model

### Battery Health Prediction Model

The backend uses a pre-trained scikit-learn model for battery health prediction.

**Input Features**:
- Internal Resistance (Ohm)
- Total Charging Cycles
- Battery Capacity (kWh)
- Fast Charge Ratio
- Average Temperature (°C)
- Vehicle Age (months)
- Average Discharge Rate (C-rate)
- Vehicle specifications (weight, aerodynamics, efficiency)
- Vehicle model (one-hot encoded)
- Battery type (one-hot encoded)
- Driving style (one-hot encoded)

**Output**:
- Battery health prediction (State of Health percentage)

### Loading the Model

The model is automatically loaded at application startup from:
```
ML_Models/ev_battery_model.pkl
```

If the model fails to load, the API will return a 500 error on prediction requests.

## 💾 Database

### SQLite Database

The application uses SQLite for storing EV profiles and route history.

**Database Location**: `ev_app.db` (in the backend root directory)

**Tables**:
- `ev_profiles`: Stores EV profile information
- `route_history`: Stores historical route analysis data
- `battery_predictions`: Stores prediction results

### Database Initialization

The database is automatically initialized on application startup:

```python
@app.on_event("startup")
async def startup_event():
    await init_db()
```

## 🔌 Middleware & CORS

CORS is pre-configured for frontend integration:

**Allowed Origins**:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- `http://localhost:*`

**Allowed Methods**: All (`GET`, `POST`, `PUT`, `DELETE`, etc.)

**Allowed Headers**: All

Configure CORS in [app/main.py](app/main.py#L8-L14) as needed for your deployment.

## 🛠️ Technologies Used

| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | Latest | Web framework |
| Uvicorn | Latest | ASGI server |
| Pydantic | Latest | Data validation |
| scikit-learn | Latest | ML predictions |
| joblib | Latest | Model serialization |
| pandas | Latest | Data processing |
| SQLite/aiosqlite | Latest | Async database |
| requests/httpx | Latest | HTTP client |
| python-dotenv | Latest | Environment variables |

## 🔑 Environment Variables

```env
# Database Configuration
DATABASE_URL=sqlite:///./ev_app.db

# External APIs
MAPBOX_ACCESS_TOKEN=pk_live_xxxxxxxxxxxx

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
WORKERS=4

# ML Model
MODEL_PATH=ML_Models/ev_battery_model.pkl
```

## 🧪 Testing

### Test API Endpoints

Use curl or a tool like Postman to test endpoints:

```bash
# Health check
curl http://localhost:8000/docs

# Prediction
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "Internal_Resistance_Ohm": 0.05,
    "Total_Charging_Cycles": 150,
    "Battery_Capacity_kWh": 82.0,
    "Fast_Charge_Ratio": 0.3,
    "Avg_Temperature_C": 25,
    "Vehicle_Age_Months": 24,
    "Avg_Discharge_Rate_C": 0.5
  }'
```

### Run Test Suite

```bash
# If pytest is available
pytest tests/

# Or use the provided test files
python test_backend.py
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process on port 8000 and kill it
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Use different port
uvicorn app.main:app --reload --port 8001
```

### Model Not Loading

- Verify `ML_Models/ev_battery_model.pkl` exists
- Check file path in [app/api/v1/endpoints/prediction.py](app/api/v1/endpoints/prediction.py#L20-L24)
- Ensure correct Python and scikit-learn versions

### Database Errors

```bash
# Reset database
rm ev_app.db
# Database will be recreated on next startup
```

### CORS Errors

- Verify frontend URL is in the allowed origins list in `app/main.py`
- Check that requests include credentials headers if needed
- Inspect browser console for exact CORS error message


## 📚 API Documentation

Once the server is running, access interactive documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These interfaces allow you to test endpoints directly from the browser.

## 🚢 Deployment

### Production Build

```bash
# Install gunicorn for production
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t greenmiles-backend .
docker run -p 8000:8000 greenmiles-backend
```

### Environment Variables for Production

```env
DEBUG=False
DATABASE_URL=postgresql://user:password@host/dbname
API_HOST=0.0.0.0
API_PORT=8000
WORKERS=4
```



## 📞 Support & Contributing

For issues or questions:
1. Check FastAPI documentation: https://fastapi.tiangolo.com/
2. Review existing GitHub issues
3. Create detailed issue reports with error messages and logs
4. Submit pull requests with improvements

## 📄 License

This project is part of the GreenMiles EV platform.

---

**Happy coding! 🚗⚡**
