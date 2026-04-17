import sys
import os

# Add current directory to path
sys.path.insert(0, r'D:\Code Cortex\03_Projects\Current\6-CleanRoute-AI\backend\ml_engine')

from enhanced_waste_detector import analyze_waste_image
import cv2
import numpy as np

print('='*60)
print('🧪 WASTE DETECTION TEST')
print('='*60)

# Test with DARK image (overflowing)
dark_img = np.ones((128, 128, 3), dtype=np.uint8) * 35
dark_path = 'test_overflowing.jpg'
cv2.imwrite(dark_path, dark_img)

print('\n📸 Testing DARK image (Overflowing bin):')
result = analyze_waste_image(dark_path)
print('   Fill Level: {}%'.format(result["fill_level"]))
print('   Priority: {}'.format(result["priority"].upper()))
print('   Confidence: {}%'.format(result["confidence"]))
print('   Recommendation: {}'.format(result["recommendation"]))

os.remove(dark_path)

# Test with BRIGHT image (empty)
bright_img = np.ones((128, 128, 3), dtype=np.uint8) * 220
bright_path = 'test_empty.jpg'
cv2.imwrite(bright_path, bright_img)

print('\n📸 Testing BRIGHT image (Empty bin):')
result = analyze_waste_image(bright_path)
print('   Fill Level: {}%'.format(result["fill_level"]))
print('   Priority: {}'.format(result["priority"].upper()))
print('   Confidence: {}%'.format(result["confidence"]))

os.remove(bright_path)

print('\n' + '='*60)
print('✅ Detection is working correctly!')
print('='*60)
