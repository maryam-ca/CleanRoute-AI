import numpy as np
from PIL import Image
import io
import math

class WasteDetectionAI:
    """AI model to detect waste level from images (using PIL only)"""
    
    @staticmethod
    def analyze_waste_level(image_file):
        """
        Analyze uploaded image to detect waste fill level
        Returns: fill_level (0-100), priority, confidence
        """
        try:
            # Open image
            img = Image.open(image_file)
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize for consistent analysis
            img = img.resize((224, 224))
            
            # Convert to numpy array
            img_array = np.array(img)
            
            # Calculate waste indicators using PIL/numpy only
            # 1. Brightness level (waste areas are typically darker)
            gray = np.mean(img_array, axis=2)
            avg_brightness = np.mean(gray)
            brightness_score = 1 - (avg_brightness / 255)
            
            # 2. Color variance (waste has more variation)
            color_variance = np.var(img_array) / (255 * 255)
            
            # 3. Edge detection using simple gradient
            if len(gray.shape) == 2:
                grad_x = np.diff(gray, axis=1)
                grad_y = np.diff(gray, axis=0)
                edge_density = (np.abs(grad_x).mean() + np.abs(grad_y).mean()) / 255
            else:
                edge_density = 0.3
            
            # Calculate fill level (0-100)
            # Weighted combination: brightness (50%), edges (30%), variance (20%)
            fill_level = int((brightness_score * 50 + edge_density * 30 + color_variance * 20))
            fill_level = min(max(fill_level, 0), 100)
            
            # Determine priority based on fill level
            if fill_level >= 80:
                priority = 'urgent'
                confidence = 0.92
                message = "URGENT: Bin is overflowing! Immediate collection required."
            elif fill_level >= 60:
                priority = 'high'
                confidence = 0.88
                message = "HIGH: Bin is nearly full. Schedule collection urgently."
            elif fill_level >= 40:
                priority = 'medium'
                confidence = 0.82
                message = "MEDIUM: Bin is partially filled. Monitor regularly."
            else:
                priority = 'low'
                confidence = 0.75
                message = "LOW: Bin has plenty of space. Routine collection only."
            
            print(f"AI Analysis: Fill={fill_level}%, Priority={priority}, Brightness={brightness_score:.2f}, Edge={edge_density:.2f}")
            
            return {
                'fill_level': fill_level,
                'priority': priority,
                'confidence': confidence,
                'message': message,
                'brightness_score': round(brightness_score, 2),
                'edge_density': round(edge_density, 2)
            }
            
        except Exception as e:
            print(f"AI analysis error: {e}")
            return {
                'fill_level': 50,
                'priority': 'medium',
                'confidence': 0.5,
                'message': "AI analysis failed. Using default values.",
                'brightness_score': 0,
                'edge_density': 0
            }

# Singleton instance
waste_detector = WasteDetectionAI()
