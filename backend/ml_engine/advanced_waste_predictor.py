"""
Advanced Waste Prediction with Multiple ML Models
- Linear Regression (baseline)
- Random Forest (non-linear patterns)
- XGBoost (gradient boosting)
- Ensemble (combined predictions)
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pickle
import os
from datetime import datetime, timedelta
import random
import warnings
warnings.filterwarnings('ignore')

class AdvancedWastePredictor:
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.model_weights = {
            'linear': 0.25,
            'ridge': 0.25,
            'random_forest': 0.25,
            'gradient_boost': 0.25
        }
        self.model_performance = {}
        
    def generate_training_data(self, days=365):
        """Generate synthetic training data with realistic patterns"""
        np.random.seed(42)
        dates = [(datetime.now() - timedelta(days=i)) for i in range(days, 0, -1)]
        
        waste = []
        features = []
        
        for i, date in enumerate(dates):
            # Base waste
            base_waste = 50
            
            # Day of week effect (Monday peak, Sunday low)
            day_of_week = date.weekday()
            dow_factor = {
                0: 1.4,   # Monday (highest)
                1: 1.1,   # Tuesday
                2: 1.0,   # Wednesday
                3: 0.9,   # Thursday
                4: 1.0,   # Friday
                5: 1.2,   # Saturday
                6: 0.7    # Sunday (lowest)
            }.get(day_of_week, 1.0)
            
            # Month effect (summer higher)
            month = date.month
            month_factor = 1 + (month - 6) * 0.03 if month > 6 else 1 + (6 - month) * 0.02
            
            # Weekend factor
            is_weekend = 1 if day_of_week >= 5 else 0
            weekend_factor = 1.15 if is_weekend else 0.95
            
            # Holiday effect (simplified)
            is_holiday = 1 if date.month == 12 and date.day in [25, 31] else 0
            holiday_factor = 1.3 if is_holiday else 1.0
            
            # Trend (slight increase over time)
            trend_factor = 1 + (i / days) * 0.1
            
            # Calculate waste
            waste_value = base_waste * dow_factor * month_factor * weekend_factor * holiday_factor * trend_factor
            
            # Add random noise
            noise = np.random.normal(0, waste_value * 0.05)
            waste_value = max(20, min(150, waste_value + noise))
            
            waste.append(round(waste_value, 1))
            
            # Features
            features.append({
                'day_of_week': day_of_week,
                'is_weekend': is_weekend,
                'month': month,
                'day_of_month': date.day,
                'is_holiday': is_holiday,
                'days_since_start': i,
                'previous_day_waste': waste[-2] if i > 0 else waste_value,
                'week_of_year': date.isocalendar()[1],
                'quarter': (month - 1) // 3 + 1
            })
        
        return pd.DataFrame(features), np.array(waste)
    
    def train(self, historical_waste=None):
        """Train multiple ML models"""
        print("=" * 60)
        print("🤖 TRAINING ADVANCED WASTE PREDICTION MODELS")
        print("=" * 60)
        
        # Generate training data
        X, y = self.generate_training_data(365)
        
        print(f"\n📊 Training data shape: {X.shape}")
        print(f"📈 Target range: {y.min():.1f} - {y.max():.1f} tons")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Model 1: Linear Regression
        self.models['linear'] = LinearRegression()
        self.models['linear'].fit(X_scaled, y)
        y_pred_linear = self.models['linear'].predict(X_scaled)
        
        # Model 2: Ridge Regression
        self.models['ridge'] = Ridge(alpha=1.0)
        self.models['ridge'].fit(X_scaled, y)
        y_pred_ridge = self.models['ridge'].predict(X_scaled)
        
        # Model 3: Random Forest
        self.models['random_forest'] = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.models['random_forest'].fit(X_scaled, y)
        y_pred_rf = self.models['random_forest'].predict(X_scaled)
        
        # Model 4: Gradient Boosting
        self.models['gradient_boost'] = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.models['gradient_boost'].fit(X_scaled, y)
        y_pred_gb = self.models['gradient_boost'].predict(X_scaled)
        
        # Calculate performance metrics
        print("\n📊 MODEL PERFORMANCE METRICS:")
        print("-" * 50)
        
        for name, y_pred in [
            ('Linear Regression', y_pred_linear),
            ('Ridge Regression', y_pred_ridge),
            ('Random Forest', y_pred_rf),
            ('Gradient Boosting', y_pred_gb)
        ]:
            mae = mean_absolute_error(y, y_pred)
            rmse = np.sqrt(mean_squared_error(y, y_pred))
            r2 = r2_score(y, y_pred)
            
            self.model_performance[name] = {
                'mae': mae,
                'rmse': rmse,
                'r2': r2
            }
            
            print(f"{name}:")
            print(f"  MAE: {mae:.2f} tons")
            print(f"  RMSE: {rmse:.2f} tons")
            print(f"  R² Score: {r2:.4f}")
        
        # Determine optimal weights based on R² scores
        total_r2 = sum(self.model_performance[m]['r2'] for m in self.model_performance)
        for name in self.model_performance:
            self.model_weights[name.lower().replace(' ', '_')] = self.model_performance[name]['r2'] / total_r2
        
        print(f"\n🎯 Model Weights (based on performance):")
        for name, weight in self.model_weights.items():
            print(f"  {name}: {weight:.2%}")
        
        # Save models
        os.makedirs('models', exist_ok=True)
        with open('models/advanced_waste_predictor.pkl', 'wb') as f:
            pickle.dump({
                'models': self.models,
                'scaler': self.scaler,
                'weights': self.model_weights,
                'performance': self.model_performance
            }, f)
        
        print("\n✅ Advanced models saved successfully!")
        return self.models
    
    def predict_future(self, days=7, recent_waste=None):
        """Predict future waste using ensemble of models"""
        if not self.models:
            try:
                with open('models/advanced_waste_predictor.pkl', 'rb') as f:
                    saved = pickle.load(f)
                    self.models = saved['models']
                    self.scaler = saved['scaler']
                    self.model_weights = saved.get('weights', self.model_weights)
            except:
                self.train()
        
        # Generate future features
        predictions = []
        confidence_intervals = []
        
        for i in range(days):
            future_date = datetime.now() + timedelta(days=i+1)
            
            # Create features for future date
            features = pd.DataFrame([{
                'day_of_week': future_date.weekday(),
                'is_weekend': 1 if future_date.weekday() >= 5 else 0,
                'month': future_date.month,
                'day_of_month': future_date.day,
                'is_holiday': 1 if future_date.month == 12 and future_date.day in [25, 31] else 0,
                'days_since_start': 365 + i,
                'previous_day_waste': recent_waste[-1] if recent_waste and len(recent_waste) > 0 else 50,
                'week_of_year': future_date.isocalendar()[1],
                'quarter': (future_date.month - 1) // 3 + 1
            }])
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Get predictions from each model
            model_predictions = {}
            for name, model in self.models.items():
                pred = model.predict(features_scaled)[0]
                model_predictions[name] = max(20, min(120, pred))
            
            # Weighted ensemble prediction
            ensemble_pred = (
                model_predictions.get('linear', 0) * self.model_weights.get('linear', 0.25) +
                model_predictions.get('ridge', 0) * self.model_weights.get('ridge', 0.25) +
                model_predictions.get('random_forest', 0) * self.model_weights.get('random_forest', 0.25) +
                model_predictions.get('gradient_boost', 0) * self.model_weights.get('gradient_boost', 0.25)
            )
            
            # Calculate confidence interval (95%)
            std_dev = np.std(list(model_predictions.values()))
            confidence_interval = (ensemble_pred - 1.96 * std_dev, ensemble_pred + 1.96 * std_dev)
            
            predictions.append(round(ensemble_pred, 1))
            confidence_intervals.append({
                'lower': round(max(20, confidence_interval[0]), 1),
                'upper': round(min(120, confidence_interval[1]), 1)
            })
            
            # Update recent_waste for next iteration
            if recent_waste:
                recent_waste.append(ensemble_pred)
        
        return predictions, confidence_intervals
    
    def get_forecast(self, days=7):
        """Get forecast with detailed information"""
        predictions, confidence_intervals = self.predict_future(days)
        
        return {
            'forecast': predictions,
            'confidence_intervals': confidence_intervals,
            'days': days,
            'total': round(sum(predictions), 1),
            'average': round(sum(predictions) / days, 1),
            'peak': max(predictions),
            'peak_day': predictions.index(max(predictions)) + 1,
            'unit': 'tons',
            'model_performance': self.model_performance,
            'model_weights': self.model_weights
        }

# Global instance
advanced_predictor = AdvancedWastePredictor()

if __name__ == "__main__":
    advanced_predictor.train()
    forecast = advanced_predictor.get_forecast(7)
    print(f"\n📊 7-Day Forecast: {forecast['forecast']}")
    print(f"📈 Confidence Intervals: {forecast['confidence_intervals']}")
