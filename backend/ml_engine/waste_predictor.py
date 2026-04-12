import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
from datetime import datetime, timedelta

class WastePredictor:
    def __init__(self):
        self.model = LinearRegression()
        self.feature_columns = None
        self.r2_score = None
        
    def prepare_features(self, df):
        """Prepare time-series features for prediction"""
        
        # Convert date to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Extract time features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        
        # Create lag features (previous day's waste)
        for area in df['area'].unique():
            area_mask = df['area'] == area
            df.loc[area_mask, 'waste_lag_1'] = df.loc[area_mask, 'waste_kg'].shift(1)
            df.loc[area_mask, 'waste_lag_7'] = df.loc[area_mask, 'waste_kg'].shift(7)
        
        # Rolling averages
        for area in df['area'].unique():
            area_mask = df['area'] == area
            df.loc[area_mask, 'waste_rolling_7'] = df.loc[area_mask, 'waste_kg'].rolling(window=7, min_periods=1).mean()
        
        # One-hot encode area
        area_dummies = pd.get_dummies(df['area'], prefix='area')
        df = pd.concat([df, area_dummies], axis=1)
        
        return df
    
    def train(self, data_path='waste_data.csv'):
        """Train linear regression model"""
        
        print("Loading waste data...")
        df = pd.read_csv(data_path)
        
        # Prepare features
        df = self.prepare_features(df)
        
        # Remove rows with NaN (from lag features)
        df = df.dropna()
        
        # Define features and target
        feature_cols = ['day_of_week', 'month', 'day_of_year', 'week_of_year',
                       'waste_lag_1', 'waste_lag_7', 'waste_rolling_7']
        
        # Add area dummy columns
        area_cols = [col for col in df.columns if col.startswith('area_')]
        feature_cols.extend(area_cols)
        
        self.feature_columns = feature_cols
        
        X = df[feature_cols]
        y = df['waste_kg']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        print("Training Linear Regression model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        self.r2_score = r2
        
        print(f"Mean Absolute Error: {mae:.2f} kg")
        print(f"R² Score: {r2:.4f}")
        
        # Save model
        self.save_model()
        
        return {
            'mae': mae,
            'r2': r2
        }
    
    def predict(self, area, date, historical_data):
        """
        Predict waste for specific area and date
        historical_data: DataFrame with historical waste data
        """
        
        # Prepare features for prediction
        features = {}
        
        features['day_of_week'] = date.weekday()
        features['month'] = date.month
        features['day_of_year'] = date.timetuple().tm_yday
        features['week_of_year'] = date.isocalendar()[1]
        
        # Get lag features from historical data
        area_data = historical_data[historical_data['area'] == area].sort_values('date')
        
        if len(area_data) >= 7:
            features['waste_lag_1'] = area_data['waste_kg'].iloc[-1]
            features['waste_lag_7'] = area_data['waste_kg'].iloc[-7] if len(area_data) >= 7 else area_data['waste_kg'].mean()
            features['waste_rolling_7'] = area_data['waste_kg'].tail(7).mean()
        else:
            features['waste_lag_1'] = area_data['waste_kg'].mean()
            features['waste_lag_7'] = area_data['waste_kg'].mean()
            features['waste_rolling_7'] = area_data['waste_kg'].mean()
        
        # Add area one-hot encoding
        for area_col in self.feature_columns:
            if area_col.startswith('area_'):
                area_name = area_col.replace('area_', '')
                features[area_col] = 1 if area_name == area else 0
        
        # Create feature vector in correct order
        feature_vector = np.array([[features[col] for col in self.feature_columns]])
        
        # Predict
        prediction = self.model.predict(feature_vector)[0]
        
        # Calculate confidence based on R²
        confidence = 0.7 + (self.r2_score * 0.3) if self.r2_score is not None else 0.85

        return max(0, prediction), min(0.95, confidence)
    
    def save_model(self, path='ml_models/waste_predictor.pkl'):
        os.makedirs('ml_models', exist_ok=True)
        joblib.dump({
            'model': self.model,
            'feature_columns': self.feature_columns,
            'r2_score': self.r2_score,
        }, path)
    
    def load_model(self, path='ml_models/waste_predictor.pkl'):
        data = joblib.load(path)
        self.model = data['model']
        self.feature_columns = data['feature_columns']
        self.r2_score = data.get('r2_score')
