import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

print("🚀 Training Waste Prediction Model...")

# Load waste data
try:
    df = pd.read_csv('complete_waste_data.csv')
except:
    # Generate sample data
    dates = pd.date_range(start='2024-01-01', periods=365, freq='D')
    df = pd.DataFrame({'date': dates})
    df['waste_generated'] = 10 + np.sin(np.arange(365) * 2 * np.pi / 7) * 3 + np.random.normal(0, 1, 365)
    df['waste_collected'] = df['waste_generated'] * np.random.uniform(0.7, 0.95, 365)

print(f"Loaded {len(df)} waste records")

# Feature engineering
df['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
df['month'] = pd.to_datetime(df['date']).dt.month
df['day'] = pd.to_datetime(df['date']).dt.day

# Create lag features
for lag in [1, 2, 3, 7]:
    df[f'lag_{lag}'] = df['waste_generated'].shift(lag)

# Rolling averages
df['rolling_mean_3'] = df['waste_generated'].rolling(3).mean()
df['rolling_mean_7'] = df['waste_generated'].rolling(7).mean()

df = df.dropna()

# Features
feature_cols = ['day_of_week', 'month', 'day', 'lag_1', 'lag_2', 'lag_3', 'lag_7', 'rolling_mean_3', 'rolling_mean_7']
X = df[feature_cols]
y = df['waste_generated']

# Train model
model = LinearRegression()
model.fit(X, y)

# Evaluate
y_pred = model.predict(X)
rmse = np.sqrt(mean_squared_error(y, y_pred))
r2 = r2_score(y, y_pred)

print(f"✅ RMSE: {rmse:.4f} tons")
print(f"✅ R² Score: {r2:.4f}")

# Save model
os.makedirs('../ml_models', exist_ok=True)
joblib.dump(model, '../ml_models/waste_predictor.pkl')
print("✅ Waste predictor saved to ml_models/waste_predictor.pkl")
