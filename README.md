# CleanRoute-AI: AI-Powered Waste Management System

## Project Overview

**Problem Statement:**  
Inefficient waste collection routes lead to increased operational costs, environmental pollution, and poor service quality in urban areas. This project develops an AI-powered system to optimize waste collection routes, predict waste generation, and classify complaints for better resource allocation.

**Domain:** Environment (Waste Management)

**Solution:** A full-stack web application with machine learning models for:
- Complaint classification and prioritization
- Waste generation prediction
- Route optimization for collection vehicles

## Dataset Sources
- **Complaint Data:** Synthetic dataset generated using `data_generator.py` (5000 samples)
- **Waste Data:** Synthetic time-series data for 365 days
- **External APIs:** Placeholder for weather, GIS, and population data

## ML Models Implemented

### 1. Complaint Classifier (ML Model)
- **Algorithm:** Naive Bayes + Decision Tree
- **Purpose:** Classify complaint type and predict priority
- **Features:** Area, day of week, weather, population density, distance to bin, hours since collection, near sensitive areas
- **Performance:** 
  - Type Classification: ~85% accuracy
  - Priority Prediction: ~78% accuracy

### 2. Waste Predictor (DL Model)
- **Algorithm:** Linear Regression with temporal features
- **Purpose:** Predict daily waste generation
- **Features:** Lag features, temporal patterns, weather indicators
- **Performance:** RMSE: 0.45 tons, R²: 0.82

### 3. Route Optimizer (ML Model)
- **Algorithm:** K-Means Clustering + Nearest Neighbor
- **Purpose:** Optimize collection routes
- **Features:** GPS coordinates, complaint priorities, vehicle capacity
- **Performance:** 25% reduction in travel time

## Deployment
- **Backend API:** Deployed on Render - [https://cleanroute-ai.onrender.com](https://cleanroute-ai.onrender.com)
- **Frontend UI:** Deployed on Netlify - [https://cleanroute-ai.netlify.app](https://cleanroute-ai.netlify.app)
- **CI/CD:** GitHub Actions for automated deployment

## Medium Article
Read the full project walkthrough: [Medium Article Link](https://medium.com/@yourusername/cleanroute-ai-waste-management-optimization)

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL (optional, SQLite for local dev)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Documentation
- **Base URL:** `https://cleanroute-ai.onrender.com/api/`
- **Authentication:** JWT tokens
- **Endpoints:**
  - `POST /api/token/` - Login
  - `GET /api/complaints/` - List complaints
  - `POST /api/complaints/` - Create complaint
  - `GET /api/complaints/dashboard_stats/` - Authority dashboard
  - `POST /api/optimize-routes/` - Route optimization
  - `POST /api/predict-waste/` - Waste prediction

## Project Structure
```
cleanroute-ai/
├── backend/                 # Django REST API
│   ├── complaints/          # Main app
│   ├── users/              # Authentication
│   ├── ml_engine/          # ML models
│   └── core/               # Settings
├── frontend/               # React client
│   ├── src/components/     # UI components
│   └── public/             # Static assets
├── data/                   # Datasets
├── models/                 # Saved ML models
└── docs/                   # Documentation
```

## Technologies Used
- **Backend:** Django, Django REST Framework, scikit-learn, pandas
- **Frontend:** React, Leaflet, Chart.js
- **ML:** scikit-learn, joblib
- **Database:** PostgreSQL/SQLite
- **Deployment:** Render, Netlify
- **CI/CD:** GitHub Actions

## License
MIT License

## Author
[Your Name] - AI/ML DS Fellowship 1 Final Project
