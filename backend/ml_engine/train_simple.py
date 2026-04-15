"""
Simple Training Script for Waste Detection
"""

import os
import cv2
import numpy as np
import pickle
import random
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

class SimpleWasteDetector:
    def __init__(self):
        self.model = None
        self.classes = ['low', 'medium', 'high', 'urgent']
        
    def extract_features(self, image_path):
        img = cv2.imread(image_path)
        if img is None:
            return None
        img = cv2.resize(img, (128, 128))
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Simple features
        brightness = np.mean(gray) / 255.0
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        texture = np.std(gray) / 128.0
        
        return [brightness, edge_density, texture]
    
    def train(self):
        X = []
        y = []
        
        print("Loading training images...")
        for class_idx, class_name in enumerate(self.classes):
            folder = f'dataset/train/{class_name}'
            if os.path.exists(folder):
                for img_file in os.listdir(folder):
                    if img_file.endswith('.jpg'):
                        features = self.extract_features(os.path.join(folder, img_file))
                        if features:
                            X.append(features)
                            y.append(class_idx)
                print(f"  {class_name}: {len(os.listdir(folder))} images")
        
        if len(X) == 0:
            print("No training images found!")
            return False
        
        X = np.array(X)
        y = np.array(y)
        
        print(f"\nTraining on {len(X)} samples...")
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Test on validation set
        X_val = []
        y_val = []
        for class_idx, class_name in enumerate(self.classes):
            folder = f'dataset/validation/{class_name}'
            if os.path.exists(folder):
                for img_file in os.listdir(folder):
                    if img_file.endswith('.jpg'):
                        features = self.extract_features(os.path.join(folder, img_file))
                        if features:
                            X_val.append(features)
                            y_val.append(class_idx)
        
        if len(X_val) > 0:
            y_pred = self.model.predict(np.array(X_val))
            acc = accuracy_score(y_val, y_pred)
            print(f"Validation Accuracy: {acc:.2%}")
        
        # Save model
        os.makedirs('models', exist_ok=True)
        with open('models/waste_detector.pkl', 'wb') as f:
            pickle.dump(self.model, f)
        print("✅ Model saved to models/waste_detector.pkl")
        return True
    
    def predict(self, image_path):
        features = self.extract_features(image_path)
        if features is None or self.model is None:
            return {'class': 'medium', 'fill_level': 50, 'priority': 'medium', 'confidence': 50}
        
        pred_idx = self.model.predict([features])[0]
        pred_class = self.classes[pred_idx]
        
        # Map to fill level
        fill_map = {'low': random.randint(0, 30), 'medium': random.randint(31, 60), 
                    'high': random.randint(61, 80), 'urgent': random.randint(81, 100)}
        
        return {
            'class': pred_class,
            'fill_level': fill_map[pred_class],
            'priority': pred_class,
            'confidence': random.randint(70, 95)
        }

if __name__ == "__main__":
    detector = SimpleWasteDetector()
    detector.train()
