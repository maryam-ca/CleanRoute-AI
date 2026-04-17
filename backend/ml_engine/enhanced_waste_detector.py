"""
Enhanced Waste Detection using YOUR Trained ML Model
"""

import cv2
import numpy as np
import pickle
import os
import sys

# Global model instance
_waste_model = None
_scaler = None
_classes = None

def load_model():
    """Load the trained waste detection model"""
    global _waste_model, _scaler, _classes
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'waste_detector.pkl')
        print(f"🔍 Loading model from: {model_path}")
        
        with open(model_path, 'rb') as f:
            saved = pickle.load(f)
            _waste_model = saved['model']
            _scaler = saved['scaler']
            _classes = saved.get('classes', ['low', 'medium', 'high', 'urgent'])
        
        print(f"✅ Model loaded! Classes: {_classes}")
        return True
    except Exception as e:
        print(f"❌ Could not load model: {e}")
        return False

def extract_features_from_image(image_path):
    """Extract features from image for model prediction"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            print(f"❌ Could not read image: {image_path}")
            return None
        
        img = cv2.resize(img, (128, 128))
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        brightness = np.mean(gray) / 255.0
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        texture = np.std(gray) / 128.0
        
        features = [brightness, edge_density, texture]
        print(f"📊 Extracted features: brightness={brightness:.3f}, edges={edge_density:.3f}, texture={texture:.3f}")
        
        return features
        
    except Exception as e:
        print(f"❌ Feature extraction error: {e}")
        return None

def analyze_waste_image(image_path, complaint_type=None, use_ml=True):
    """Analyze waste image using trained ML model"""
    
    print(f"\n🔍 Analyzing image: {image_path}")
    
    # Load model
    if use_ml:
        load_model()
    
    # Extract features
    features = extract_features_from_image(image_path)
    
    if features is None:
        return {
            'success': False,
            'error': 'Could not analyze image'
        }
    
    # Use ML model if available
    if use_ml and _waste_model is not None and _scaler is not None:
        try:
            features_scaled = _scaler.transform([features])
            prediction = _waste_model.predict(features_scaled)[0]
            probabilities = _waste_model.predict_proba(features_scaled)[0]
            confidence = max(probabilities) * 100
            
            priority_map = {0: 'low', 1: 'medium', 2: 'high', 3: 'urgent'}
            fill_level_map = {'low': 20, 'medium': 45, 'high': 70, 'urgent': 90}
            recommendation_map = {
                'low': '✅ Schedule collection within 72 hours',
                'medium': '📅 Schedule collection within 48 hours',
                'high': '⚠️ Schedule collection within 24 hours',
                'urgent': '🚨 URGENT: Bin is overflowing! Immediate action required!'
            }
            
            priority = priority_map[prediction]
            fill_level = fill_level_map[priority]
            recommendation = recommendation_map[priority]
            
            print(f"🎯 ML Prediction: {priority.upper()} (confidence: {confidence:.1f}%)")
            
            return {
                'success': True,
                'fill_level': fill_level,
                'priority': priority,
                'confidence': round(confidence, 1),
                'recommendation': recommendation,
                'method': 'ML Model (Random Forest)'
            }
            
        except Exception as e:
            print(f"❌ ML prediction error: {e}")
    
    # Fallback: brightness-based detection
    print("⚠️ Using fallback brightness detection")
    brightness = features[0]
    
    if brightness < 0.2:
        fill_level = 90
        priority = 'urgent'
    elif brightness < 0.35:
        fill_level = 70
        priority = 'high'
    elif brightness < 0.6:
        fill_level = 45
        priority = 'medium'
    else:
        fill_level = 20
        priority = 'low'
    
    return {
        'success': True,
        'fill_level': fill_level,
        'priority': priority,
        'confidence': 75.0,
        'recommendation': f'Detected as {priority.upper()}',
        'method': 'Fallback (Brightness)'
    }

print("✅ Enhanced waste detector ready")
