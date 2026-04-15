"""
Waste Prediction Model using Linear Regression
Predicts daily waste generation for future days
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import pickle
import os
from datetime import datetime, timedelta
import random

class WastePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        
    def generate_sample_data(self, days=30):
        """Generate sample waste data for training"""
        dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days, 0, -1)]
        waste = []
        
        for i in range(days):
            # Simulate waste with weekly pattern
            day_of_week = i % 7
            base_waste = 50
            if day_of_week >= 5:  # Weekend
                base_waste = 65
            elif day_of_week == 0:  # Monday
                base_waste = 70
            elif day_of_week == 3:  # Thursday
                base_waste = 45
            
            # Add random variation
            waste.append(base_waste + random.uniform(-10, 10))
        
        return dates, waste
    
    def train(self, waste_data=None):
        """Train the linear regression model"""
        if waste_data is None:
            dates, waste = self.generate_sample_data(30)
        else:
            waste = waste_data
        
        # Create features (day of week, day of month, is_weekend)
        X = []
        for i in range(len(waste)):
            day_of_week = i % 7
            features = [
                day_of_week,
                1 if day_of_week >= 5 else 0,  # is_weekend
                (i % 30) / 30.0,  # day of month normalized
                waste[i-1] if i > 0 else waste[0]  # previous day waste
            ]
            X.append(features)
        
        # Remove first row for training (needs previous day)
        X = np.array(X[1:])
        y = np.array(waste[1:])
        
        # Train model
        self.model = LinearRegression()
        self.model.fit(X, y)
        
        # Save model
        os.makedirs('models', exist_ok=True)
        with open('models/waste_predictor.pkl', 'wb') as f:
            pickle.dump(self.model, f)
        
        # Calculate metrics
        y_pred = self.model.predict(X)
        rmse = np.sqrt(mean_squared_error(y, y_pred))
        r2 = r2_score(y, y_pred)
        
        print(f"✅ Waste Prediction Model Trained")
        print(f"   RMSE: {rmse:.2f} tons")
        print(f"   R² Score: {r2:.2f}")
        
        return self.model
    
    def predict_future(self, days=7, recent_waste=None):
        """Predict waste for future days"""
        if self.model is None:
            # Try to load existing model
            if os.path.exists('models/waste_predictor.pkl'):
                with open('models/waste_predictor.pkl', 'rb') as f:
                    self.model = pickle.load(f)
            else:
                # Train a new model
                self.train()
        
        # Get recent waste data (last 7 days)
        if recent_waste is None:
            # Generate sample recent waste
            recent_waste = [random.uniform(40, 80) for _ in range(7)]
        
        predictions = []
        last_waste = recent_waste[-1]
        
        for i in range(days):
            day_of_week = (datetime.now().weekday() + i) % 7
            features = np.array([[
                day_of_week,
                1 if day_of_week >= 5 else 0,
                (i % 30) / 30.0,
                last_waste
            ]])
            
            pred = self.model.predict(features)[0]
            pred = max(20, min(120, pred))  # Clamp between 20-120 tons
            predictions.append(round(pred, 1))
            last_waste = pred
        
        return predictions
    
    def get_forecast(self, days=7):
        """Get forecast with additional info"""
        predictions = self.predict_future(days)
        
        return {
            'forecast': predictions,
            'days': days,
            'total': sum(predictions),
            'average': round(sum(predictions) / days, 1),
            'peak': max(predictions),
            'peak_day': predictions.index(max(predictions)) + 1,
            'unit': 'tons'
        }

# Test function
if __name__ == "__main__":
    predictor = WastePredictor()
    predictor.train()
    forecast = predictor.predict_future(7)
    print(f"\n7-Day Forecast: {forecast}")
    print(f"Total: {sum(forecast):.1f} tons")
    print(f"Average: {sum(forecast)/7:.1f} tons/day")
