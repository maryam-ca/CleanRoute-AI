import numpy as np
import pandas as pd
from PIL import Image
import joblib
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ML_MODELS_DIR = PROJECT_ROOT / 'ml_models'

class WasteDetectionAI:
    """AI model to detect waste level from images using trained ML models"""
    
    def __init__(self):
        self.fill_model = None
        self.priority_model = None
        self.label_encoder = None
        self.load_models()
    
    def load_models(self):
        """Load trained ML models"""
        try:
            fill_model_path = ML_MODELS_DIR / 'fill_level_model.pkl'
            if fill_model_path.exists():
                self.fill_model = joblib.load(fill_model_path)
                print("Fill level model loaded")
            else:
                print("Fill level model not found, using fallback")
        except Exception as e:
            print(f"Error loading fill model: {e}")
        
        try:
            priority_model_path = ML_MODELS_DIR / 'priority_model.pkl'
            encoder_path = ML_MODELS_DIR / 'priority_label_encoder.pkl'
            if priority_model_path.exists() and encoder_path.exists():
                self.priority_model = joblib.load(priority_model_path)
                self.label_encoder = joblib.load(encoder_path)
                print("Priority model loaded")
            else:
                print("Priority model not found, using fallback")
        except Exception as e:
            print(f"Error loading priority model: {e}")
    
    def extract_features(self, image_file):
        """Extract features from uploaded image"""
        try:
            img = Image.open(image_file)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img = img.resize((224, 224))
            img_array = np.array(img) / 255.0
            
            # Extract features
            gray = np.mean(img_array, axis=2)
            brightness = np.mean(gray)
            edge_density = self.calculate_edge_density(gray)
            color_variance = np.var(img_array)
            
            # Calculate texture (local variance)
            from scipy import ndimage
            texture = np.mean(ndimage.variance(gray))
            
            return {
                'brightness': brightness,
                'edge_density': edge_density,
                'color_variance': color_variance,
                'texture': texture
            }
        except Exception as e:
            print(f"Feature extraction error: {e}")
            return None
    
    def calculate_edge_density(self, gray):
        """Calculate edge density"""
        grad_x = np.diff(gray, axis=1)
        grad_y = np.diff(gray, axis=0)
        edge_density = (np.abs(grad_x).mean() + np.abs(grad_y).mean()) / 2
        return float(edge_density)
    
    def predict_priority(self, image_file, complaint_type="", is_near_sensitive=False):
        """Predict priority using trained ML model"""
        features = self.extract_features(image_file)
        
        if features is None:
            return self.fallback_prediction(complaint_type, is_near_sensitive)
        
        feature_array = pd.DataFrame([{
            'brightness': features['brightness'],
            'edge_density': features['edge_density'],
            'color_variance': features['color_variance'],
            'texture': features['texture']
        }])
        
        # Predict fill level
        if self.fill_model:
            fill_level = float(self.fill_model.predict(feature_array)[0])
            fill_level = min(max(fill_level, 0), 100)
        else:
            fill_level = 50
        
        # Predict priority
        if self.priority_model and self.label_encoder:
            priority_idx = self.priority_model.predict(feature_array)[0]
            priority = self.label_encoder.inverse_transform([priority_idx])[0]
            confidence = float(np.max(self.priority_model.predict_proba(feature_array)))
        else:
            # Fallback logic
            if fill_level >= 80:
                priority = 'urgent'
            elif fill_level >= 60:
                priority = 'high'
            elif fill_level >= 40:
                priority = 'medium'
            else:
                priority = 'low'
            confidence = 0.85
        
        # Boost priority if near sensitive area
        if is_near_sensitive and priority in ['medium', 'low']:
            priority = 'high'
        
        return {
            'fill_level': int(fill_level),
            'priority': priority,
            'confidence': round(confidence, 2),
            'message': self.get_priority_message(priority, fill_level)
        }
    
    def get_priority_message(self, priority, fill_level):
        messages = {
            'urgent': f'URGENT: Bin is {fill_level}% full! Immediate action required.',
            'high': f'HIGH: Bin is {fill_level}% full. Schedule collection urgently.',
            'medium': f'MEDIUM: Bin is {fill_level}% full. Monitor regularly.',
            'low': f'LOW: Bin is {fill_level}% full. Routine collection only.'
        }
        return messages.get(priority, f'Priority: {priority} (Fill: {fill_level}%)')
    
    def fallback_prediction(self, complaint_type, is_near_sensitive):
        """Fallback prediction when ML model fails"""
        type_fill = {
            'overflowing': 85,
            'spillage': 60,
            'illegal': 70,
            'missed': 50,
            'other': 40
        }
        fill_level = type_fill.get(complaint_type, 50)
        
        if fill_level >= 80:
            priority = 'urgent'
        elif fill_level >= 60:
            priority = 'high'
        elif fill_level >= 40:
            priority = 'medium'
        else:
            priority = 'low'
        
        if is_near_sensitive and priority in ['medium', 'low']:
            priority = 'high'
        
        return {
            'fill_level': fill_level,
            'priority': priority,
            'confidence': 0.75,
            'message': self.get_priority_message(priority, fill_level)
        }

waste_detector = WasteDetectionAI()
