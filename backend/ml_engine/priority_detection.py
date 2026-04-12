import base64
import io
import numpy as np
from PIL import Image, ImageStat
import joblib
import os
import colorsys

class PriorityDetectionService:
    """AI service to detect priority from uploaded images"""
    
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load pre-trained model for priority detection"""
        model_path = 'ml_models/priority_detector.pkl'
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                print("✅ Priority detection model loaded")
            except:
                print("⚠️ Could not load priority model, using fallback")
                self.model = None
        else:
            print("⚠️ No priority model found, using fallback detection")
            self.model = None
    
    def extract_image_features(self, image_file):
        """Extract advanced features from uploaded image"""
        try:
            # Open image
            img = Image.open(image_file)
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize to standard size
            img_resized = img.resize((224, 224))
            
            # Convert to numpy array
            img_array = np.array(img_resized) / 255.0
            
            # Extract advanced features
            features = {
                'brightness': np.mean(img_array),
                'contrast': np.std(img_array),
                'edge_density': self.calculate_edge_density(img_array),
                'color_variance': np.var(img_array),
                'dark_region_ratio': self.calculate_dark_regions(img_array),
                'texture_complexity': self.calculate_texture_complexity(img_array),
                'waste_detection_score': self.detect_waste_amount_advanced(img_array, img),
                'fill_level_estimate': self.estimate_fill_level(img)
            }
            
            return features
        except Exception as e:
            print(f"Error extracting features: {e}")
            return None
    
    def calculate_edge_density(self, img_array):
        """Calculate edge density as proxy for waste amount"""
        if len(img_array.shape) == 3:
            gray = np.mean(img_array, axis=2)
        else:
            gray = img_array
        
        # Calculate gradient
        grad_x = np.diff(gray, axis=1)
        grad_y = np.diff(gray, axis=0)
        
        # Edge density
        edge_density = (np.abs(grad_x).mean() + np.abs(grad_y).mean()) / 2
        return float(edge_density)
    
    def calculate_dark_regions(self, img_array):
        """Calculate ratio of dark regions (indicating waste)"""
        if len(img_array.shape) == 3:
            # Convert to perceived brightness
            brightness = 0.299 * img_array[:,:,0] + 0.587 * img_array[:,:,1] + 0.114 * img_array[:,:,2]
        else:
            brightness = img_array
        
        # Dark regions threshold (darker = more likely waste)
        dark_threshold = 0.4
        dark_ratio = np.mean(brightness < dark_threshold)
        return float(dark_ratio)
    
    def calculate_texture_complexity(self, img_array):
        """Calculate texture complexity (waste has higher complexity)"""
        if len(img_array.shape) == 3:
            gray = np.mean(img_array, axis=2)
        else:
            gray = img_array
        
        # Local variance as texture measure
        from scipy import ndimage
        local_var = ndimage.variance(gray, labels=None, index=None)
        return float(np.mean(local_var))
    
    def detect_waste_amount_advanced(self, img_array, original_img):
        """Advanced waste detection using multiple features"""
        score = 0
        
        # Factor 1: Dark regions (waste typically darker)
        dark_ratio = self.calculate_dark_regions(img_array)
        score += dark_ratio * 40
        
        # Factor 2: Edge density (overflowing bins have more edges)
        edge_density = self.calculate_edge_density(img_array)
        score += min(edge_density * 30, 30)
        
        # Factor 3: Color analysis - waste bins often have specific color patterns
        color_score = self.analyze_colors(original_img)
        score += color_score * 20
        
        # Factor 4: Texture complexity
        texture = self.calculate_texture_complexity(img_array)
        score += min(texture / 100 * 10, 10)
        
        return min(score / 100, 1.0)  # Normalize to 0-1
    
    def analyze_colors(self, img):
        """Analyze color distribution for waste detection"""
        try:
            # Get color histogram
            hist = img.histogram()
            
            # Check for presence of typical waste colors (browns, grays, dark colors)
            # This is simplified - in production, use a trained classifier
            return 0.6  # Default moderate score
        except:
            return 0.5
    
    def estimate_fill_level(self, img):
        """Estimate bin fill level from image"""
        try:
            # Convert to HSV for better analysis
            img_hsv = img.convert('HSV')
            h, s, v = img_hsv.split()
            
            # Convert to arrays
            v_array = np.array(v)
            
            # Dark areas (low value) indicate waste/fill
            dark_mask = v_array < 100
            fill_ratio = np.sum(dark_mask) / dark_mask.size
            
            # Estimate fill level (0-100%)
            estimated_fill = min(int(fill_ratio * 120), 100)
            
            return estimated_fill
        except:
            return 50  # Default
    
    def predict_priority(self, image_file, complaint_type="", is_near_sensitive=False):
        """Predict priority based on image and context"""
        
        features = self.extract_image_features(image_file)
        
        if features is None:
            # Fallback based on complaint type and location
            return self.fallback_priority(complaint_type, is_near_sensitive)
        
        # Calculate priority score (0-100)
        priority_score = 0
        
        # Factor 1: Waste amount detection (0-35 points)
        waste_score = features.get('waste_detection_score', 0)
        priority_score += waste_score * 35
        
        # Factor 2: Fill level estimate (0-30 points)
        fill_level = features.get('fill_level_estimate', 50)
        fill_score = fill_level / 100 * 30
        priority_score += fill_score
        
        # Factor 3: Edge density (indicates overflow) (0-20 points)
        edge_density = features.get('edge_density', 0)
        priority_score += min(edge_density * 20, 20)
        
        # Factor 4: Dark region ratio (0-15 points)
        dark_ratio = features.get('dark_region_ratio', 0)
        priority_score += dark_ratio * 15
        
        # Factor 5: Complaint type weight (0-20 points)
        type_weights = {
            'overflowing': 20,
            'spillage': 15,
            'illegal': 18,
            'missed': 10,
            'other': 5
        }
        priority_score += type_weights.get(complaint_type, 5)
        
        # Factor 6: Sensitive area (0-10 points)
        if is_near_sensitive:
            priority_score += 10
        
        # Determine priority based on score
        if priority_score >= 70:
            priority = 'urgent'
            confidence = min(priority_score / 100, 0.95)
            fill_text = "Critical - Immediate action required"
        elif priority_score >= 50:
            priority = 'high'
            confidence = priority_score / 100
            fill_text = "High - Schedule collection urgently"
        elif priority_score >= 30:
            priority = 'medium'
            confidence = priority_score / 100
            fill_text = "Medium - Needs attention soon"
        else:
            priority = 'low'
            confidence = max(priority_score / 100, 0.5)
            fill_text = "Low - Monitor regularly"
        
        return {
            'priority': priority,
            'confidence': round(confidence, 2),
            'fill_level': fill_level,
            'score': round(priority_score, 1),
            'fill_text': fill_text,
            'features': {
                'waste_score': round(waste_score * 100, 1),
                'fill_score': round(fill_score, 1),
                'edge_score': round(min(edge_density * 20, 20), 1)
            }
        }
    
    def fallback_priority(self, complaint_type, is_near_sensitive):
        """Fallback priority detection without image"""
        type_priority = {
            'overflowing': 'high',
            'spillage': 'medium',
            'illegal': 'high',
            'missed': 'medium',
            'other': 'low'
        }
        
        priority = type_priority.get(complaint_type, 'medium')
        
        if is_near_sensitive and priority in ['medium', 'low']:
            priority = 'high'
        
        # Estimate fill level based on complaint type
        fill_level = {
            'overflowing': 85,
            'spillage': 60,
            'illegal': 70,
            'missed': 50,
            'other': 40
        }.get(complaint_type, 50)
        
        return {
            'priority': priority,
            'confidence': 0.65,
            'fill_level': fill_level,
            'score': 50,
            'fill_text': "Based on complaint type",
            'features': None
        }

# Singleton instance
priority_detector = PriorityDetectionService()
