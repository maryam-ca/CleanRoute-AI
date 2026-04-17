"""
Train Waste Detection Model Using YOUR Dataset
Dataset structure:
- dataset/train/low/ (5 images)
- dataset/train/medium/ (16 images)
- dataset/train/high/ (7 images)
- dataset/train/urgent/ (37 images)
"""

import os
import cv2
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import glob

print("=" * 60)
print("🤖 TRAINING WASTE DETECTION ON YOUR DATASET")
print("=" * 60)

# Your dataset path
base_path = r"D:\Code Cortex\03_Projects\Current\6-CleanRoute-AI\backend\ml_engine\dataset\train"
categories = ['low', 'medium', 'high', 'urgent']
priority_map = {'low': 0, 'medium': 1, 'high': 2, 'urgent': 3}

def extract_features(image_path):
    """Extract features from image"""
    img = cv2.imread(image_path)
    if img is None:
        return None
    img = cv2.resize(img, (128, 128))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    brightness = np.mean(gray) / 255.0
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    texture = np.std(gray) / 128.0
    
    return [brightness, edge_density, texture]

# Collect training data
X_train = []
y_train = []

print("\n📂 Loading training images...")
print("-" * 40)

for category in categories:
    cat_path = os.path.join(base_path, category)
    if not os.path.exists(cat_path):
        print(f"   ❌ {category}: folder not found")
        continue
    
    images = glob.glob(os.path.join(cat_path, "*.jpg")) + \
             glob.glob(os.path.join(cat_path, "*.jpeg")) + \
             glob.glob(os.path.join(cat_path, "*.png"))
    
    print(f"   ✅ {category}: {len(images)} images")
    
    for img_path in images:
        features = extract_features(img_path)
        if features:
            X_train.append(features)
            y_train.append(priority_map[category])

print(f"\n📊 Total training samples: {len(X_train)}")

if len(X_train) < 10:
    print("❌ Not enough training data!")
    exit()

# Train model
print("\n🧠 Training Random Forest...")

X_train = np.array(X_train)
y_train = np.array(y_train)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y_train)

# Test accuracy
y_pred = model.predict(X_scaled)
accuracy = np.mean(y_pred == y_train) * 100
print(f"📈 Training Accuracy: {accuracy:.1f}%")

# Save model
os.makedirs('models', exist_ok=True)
with open('models/waste_detector.pkl', 'wb') as f:
    pickle.dump({'model': model, 'scaler': scaler, 'classes': categories}, f)

print("\n✅ Model saved to models/waste_detector.pkl")

# Quick test
print("\n🧪 Testing on one image per category:")
for category in categories:
    cat_path = os.path.join(base_path, category)
    images = glob.glob(os.path.join(cat_path, "*.jpg"))
    if images:
        features = extract_features(images[0])
        features_scaled = scaler.transform([features])
        pred = model.predict(features_scaled)[0]
        print(f"   {category}: predicted as {categories[pred]}")

print("\n✅ Training complete!")
