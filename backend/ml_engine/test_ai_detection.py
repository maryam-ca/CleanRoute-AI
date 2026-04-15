"""
Test AI Waste Detection System
Run: python test_ai_detection.py
"""

import os
import cv2
import numpy as np
import random
from enhanced_waste_detector import analyze_waste_image

def create_test_image(fill_type):
    """Create synthetic test images for different fill levels"""
    img = np.ones((256, 256, 3), dtype=np.uint8) * 200
    
    if fill_type == 'empty':
        # Empty bin - bright, few edges
        img = np.ones((256, 256, 3), dtype=np.uint8) * 230
        # Add slight texture
        noise = np.random.randint(0, 20, (256, 256, 3), dtype=np.uint8)
        img = cv2.addWeighted(img, 0.9, noise, 0.1, 0)
        
    elif fill_type == 'half':
        # Half full - medium brightness, some edges
        img = np.ones((256, 256, 3), dtype=np.uint8) * 160
        # Add waste area in lower half
        img[128:256, :] = [100, 100, 100]
        # Add some edges
        edges = np.random.randint(0, 255, (128, 256)).astype(np.uint8)
        edges = cv2.Canny(edges, 50, 150)
        img[128:256, :][edges > 0] = [0, 0, 0]
        
    elif fill_type == 'full':
        # Full bin - darker, more edges
        img = np.ones((256, 256, 3), dtype=np.uint8) * 100
        # Add waste texture
        for _ in range(50):
            x = random.randint(0, 255)
            y = random.randint(0, 255)
            cv2.circle(img, (x, y), random.randint(2, 8), (random.randint(0, 50), random.randint(0, 50), random.randint(0, 50)), -1)
        
    else:  # overflowing
        # Overflowing - very dark, many edges
        img = np.ones((256, 256, 3), dtype=np.uint8) * 60
        # Add many edges/texture
        for _ in range(200):
            x1 = random.randint(0, 255)
            y1 = random.randint(0, 255)
            x2 = x1 + random.randint(-20, 20)
            y2 = y1 + random.randint(-20, 20)
            cv2.line(img, (x1, y1), (x2, y2), (random.randint(0, 30), random.randint(0, 30), random.randint(0, 30)), random.randint(1, 3))
    
    return img

def run_tests():
    print("\n" + "="*60)
    print("🤖 AI WASTE DETECTION SYSTEM TEST")
    print("="*60)
    
    test_cases = [
        ("Empty Bin (0-20%)", "empty", "low", 0, 20),
        ("Half Full Bin (30-50%)", "half", "medium", 30, 50),
        ("Full Bin (60-80%)", "full", "high", 60, 80),
        ("Overflowing Bin (85-100%)", "overflowing", "urgent", 85, 100)
    ]
    
    results = []
    
    for name, fill_type, expected_priority, min_level, max_level in test_cases:
        print(f"\n📸 Testing: {name}")
        print("-" * 40)
        
        # Create test image
        img = create_test_image(fill_type)
        temp_path = f"test_{fill_type}.jpg"
        cv2.imwrite(temp_path, img)
        
        # Analyze
        result = analyze_waste_image(temp_path)
        
        # Clean up
        os.remove(temp_path)
        
        if result['success']:
            fill_level = result['fill_level']
            priority = result['priority']
            confidence = result['confidence']
            
            print(f"   Detected Fill Level: {fill_level}%")
            print(f"   Expected Range: {min_level}-{max_level}%")
            print(f"   Detected Priority: {priority.upper()}")
            print(f"   Expected Priority: {expected_priority.upper()}")
            print(f"   Confidence: {confidence}%")
            print(f"   Recommendation: {result['recommendation']}")
            
            # Check if fill level is in expected range
            in_range = min_level <= fill_level <= max_level
            priority_match = priority == expected_priority
            
            is_correct = in_range or priority_match
            results.append(is_correct)
            
            if in_range and priority_match:
                status = "✅ PERFECT"
            elif in_range:
                status = "✅ GOOD (range correct)"
            elif priority_match:
                status = "✅ GOOD (priority correct)"
            else:
                status = "⚠️ NEEDS IMPROVEMENT"
            
            print(f"   Status: {status}")
        else:
            print(f"   ❌ Analysis failed: {result.get('error')}")
            results.append(False)
    
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100
    
    print(f"Passed: {passed}/{total} ({percentage:.1f}%)")
    
    if percentage == 100:
        print("\n🎉 AI Detection System is WORKING PERFECTLY!")
    elif percentage >= 75:
        print("\n✅ AI Detection System is working well!")
    else:
        print("\n⚠️ Detection needs calibration.")
    
    print("\n🚀 AI Detection System Ready!")

if __name__ == "__main__":
    run_tests()
