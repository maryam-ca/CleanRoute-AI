"""
Test Trained ML Waste Detection Model
"""

import pickle
import cv2
import numpy as np
import os

# Load trained model
with open('models/waste_detector.pkl', 'rb') as f:
    model = pickle.load(f)

classes = ['low', 'medium', 'high', 'urgent']

def extract_features(image_path):
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

def predict_fill_level(image_path):
    features = extract_features(image_path)
    if features is None:
        return 50, 'medium'
    
    pred_idx = model.predict([features])[0]
    pred_class = classes[pred_idx]
    
    # Map class to fill level
    fill_map = {'low': 20, 'medium': 45, 'high': 70, 'urgent': 90}
    return fill_map[pred_class], pred_class

print("="*50)
print("🤖 TRAINED ML MODEL TEST")
print("="*50)

categories = ['low', 'medium', 'high', 'urgent']

for cat in categories:
    folder = f'dataset/train/{cat}'
    if os.path.exists(folder):
        images = [f for f in os.listdir(folder) if f.endswith('.jpg')]
        if images:
            fill_level, pred_class = predict_fill_level(os.path.join(folder, images[0]))
            print(f"\n📸 {cat.upper()}:")
            print(f"   Predicted Fill Level: {fill_level}%")
            print(f"   Predicted Class: {pred_class.upper()}")
            print(f"   Expected: {cat.upper()}")

print("\n" + "="*50)
print("✅ Test Complete")
print("="*50)
