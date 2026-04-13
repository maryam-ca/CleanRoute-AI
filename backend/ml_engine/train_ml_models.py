import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

print("🚀 Training Fill Level Detection Model...")

# Generate synthetic training data
np.random.seed(42)
n_samples = 5000

# Features: brightness, edge_density, color_variance, texture
brightness = np.random.uniform(0.1, 0.9, n_samples)
edge_density = np.random.uniform(0.05, 0.6, n_samples)
color_variance = np.random.uniform(0.01, 0.3, n_samples)
texture = np.random.uniform(0.1, 0.8, n_samples)

# Target: fill_level (0-100)
# Lower brightness + higher edge density = higher fill level
fill_level = (1 - brightness) * 60 + edge_density * 30 + color_variance * 10
fill_level = np.clip(fill_level, 0, 100)

# Priority based on fill level
priority = []
for fl in fill_level:
    if fl >= 80:
        priority.append('urgent')
    elif fl >= 60:
        priority.append('high')
    elif fl >= 40:
        priority.append('medium')
    else:
        priority.append('low')

# Create DataFrame
df = pd.DataFrame({
    'brightness': brightness,
    'edge_density': edge_density,
    'color_variance': color_variance,
    'texture': texture,
    'fill_level': fill_level,
    'priority': priority
})

print(f"Generated {len(df)} training samples")

# Train Fill Level Regression Model
from sklearn.ensemble import RandomForestRegressor
X = df[['brightness', 'edge_density', 'color_variance', 'texture']]
y_fill = df['fill_level']

X_train, X_test, y_train, y_test = train_test_split(X, y_fill, test_size=0.2, random_state=42)

fill_model = RandomForestRegressor(n_estimators=100, random_state=42)
fill_model.fit(X_train, y_train)
fill_score = fill_model.score(X_test, y_test)
print(f"✅ Fill Level Model R² Score: {fill_score:.4f}")

# Train Priority Classification Model
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y_priority = le.fit_transform(df['priority'])

X_train, X_test, y_train, y_test = train_test_split(X, y_priority, test_size=0.2, random_state=42)

priority_model = RandomForestClassifier(n_estimators=100, random_state=42)
priority_model.fit(X_train, y_train)
priority_accuracy = accuracy_score(y_test, priority_model.predict(X_test))
print(f"✅ Priority Model Accuracy: {priority_accuracy:.4f}")

# Save models
os.makedirs('../ml_models', exist_ok=True)
joblib.dump(fill_model, '../ml_models/fill_level_model.pkl')
joblib.dump(priority_model, '../ml_models/priority_model.pkl')
joblib.dump(le, '../ml_models/priority_label_encoder.pkl')

print("✅ Models saved to ml_models/")
