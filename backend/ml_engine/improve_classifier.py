import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

print("🚀 Training Improved Complaint Classifier...")

# Load data
df = pd.read_csv('complete_complaint_dataset.csv')
print(f"Loaded {len(df)} complaints")

# Feature engineering
df['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
df['hour'] = np.random.randint(0, 24, len(df))
df['is_night'] = (df['hour'].between(22, 6)).astype(int)

# Select features
feature_cols = ['day_of_week', 'is_weekend', 'hour', 'is_night', 
                'population_density', 'distance_to_bin', 'hours_since_collection',
                'is_near_sensitive']

# Encode target
le_type = LabelEncoder()
le_priority = LabelEncoder()

df['complaint_type_encoded'] = le_type.fit_transform(df['complaint_type'])
df['priority_encoded'] = le_priority.fit_transform(df['priority'])

# Train Type Classifier
X = df[feature_cols]
y_type = df['complaint_type_encoded']
y_priority = df['priority_encoded']

X_train, X_test, y_type_train, y_type_test = train_test_split(X, y_type, test_size=0.2, random_state=42)
X_train, X_test, y_pri_train, y_pri_test = train_test_split(X, y_priority, test_size=0.2, random_state=42)

# Random Forest for better accuracy
rf_type = RandomForestClassifier(n_estimators=100, random_state=42)
rf_type.fit(X_train, y_type_train)
y_type_pred = rf_type.predict(X_test)
type_accuracy = accuracy_score(y_type_test, y_type_pred)
print(f"✅ Type Classification Accuracy: {type_accuracy:.4f}")

rf_priority = RandomForestClassifier(n_estimators=100, random_state=42)
rf_priority.fit(X_train, y_pri_train)
y_pri_pred = rf_priority.predict(X_test)
priority_accuracy = accuracy_score(y_pri_test, y_pri_pred)
print(f"✅ Priority Classification Accuracy: {priority_accuracy:.4f}")

# Save models
os.makedirs('../ml_models', exist_ok=True)
joblib.dump(rf_type, '../ml_models/random_forest_type.pkl')
joblib.dump(rf_priority, '../ml_models/random_forest_priority.pkl')
joblib.dump(le_type, '../ml_models/label_encoder_type.pkl')
joblib.dump(le_priority, '../ml_models/label_encoder_priority.pkl')

print("✅ Models saved to ml_models/")
