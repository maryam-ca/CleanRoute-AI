# 🗑️ CleanRoute-AI - Smart Waste Management System

## 📌 Project Overview
CleanRoute-AI is an AI-powered smart waste management system that uses computer vision, machine learning, and route optimization to improve waste collection efficiency in urban areas.

## 🎯 Problem Statement
Traditional waste management faces challenges:
- Inefficient collection routes
- Delayed complaint resolution
- No real-time monitoring
- Manual waste level detection
- Poor resource allocation

## 💡 Solution
CleanRoute-AI provides:
- AI-based waste detection from images
- Automated priority classification
- Smart route optimization using K-Means clustering
- Waste prediction using Linear Regression
- Real-time complaint mapping
- Anomaly detection for illegal dumping

## 🏗️ System Architecture

### Frontend (React.js)
- User Dashboard
- Complaint Submission with Image Upload
- Real-time Maps (Leaflet)
- Admin Panel
- Tester Dashboard
- Reports & Analytics

### Backend (Django REST Framework)
- RESTful APIs
- JWT Authentication
- SQLite Database
- WebSocket for real-time updates

### ML Engine (Python)
- Waste Detection (Computer Vision)
- Priority Classification (Decision Tree)
- Route Optimization (K-Means)
- Waste Prediction (Linear Regression)
- Anomaly Detection (Isolation Forest)

## 🔧 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Material-UI, Leaflet |
| Backend | Django, Django REST Framework |
| ML/AI | Scikit-learn, OpenCV, NumPy |
| Database | SQLite |
| Deployment | Render (Backend), Vercel (Frontend) |
| Authentication | JWT |

## 📊 ML Models Implemented

### 1. Waste Detection
- **Algorithm**: Computer Vision (Edge Detection + Color Analysis)
- **Accuracy**: 90% (20%,45%,70%,90% fill levels)
- **Output**: Fill level percentage and priority

### 2. Priority Classification  
- **Algorithm**: Decision Tree + Naive Bayes
- **Accuracy**: 87.9%
- **Output**: URGENT/HIGH/MEDIUM/LOW priority

### 3. Route Optimization
- **Algorithm**: K-Means Clustering
- **Performance**: 18 complaints → 5 optimal routes
- **Time Saved**: 25%

### 4. Waste Prediction
- **Algorithm**: Linear Regression
- **RMSE**: 6.09 tons
- **Output**: 7-day waste forecast

## 👥 User Roles

| Role | Credentials | Permissions |
|------|-------------|-------------|
| Admin | admin/admin123 | Full system access, assign tasks |
| Citizen | citizen/citizen123 | Submit complaints, track status |
| Tester | tester1/tester123 | Complete assigned tasks |

## 🌐 Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://cleanroute-ai-prod.vercel.app |
| Backend API | https://cleanroute-ai.onrender.com/api/ |

## 📈 Key Features

✅ AI Waste Detection from Images
✅ Priority Classification (URGENT/HIGH/MEDIUM/LOW)
✅ Route Optimization (18 complaints → 5 routes)
✅ 7-Day Waste Prediction
✅ Real-time Complaint Map
✅ Anomaly Detection for Illegal Dumping
✅ Admin Dashboard
✅ Tester Task Management

## 🚀 Future Enhancements

- LSTM Deep Learning for advanced prediction
- Vehicle GPS tracking
- SMS/Email notifications
- Mobile application
- IoT sensor integration

