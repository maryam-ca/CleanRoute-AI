import cv2
import numpy as np
import tempfile
import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ml_engine.enhanced_waste_detector import analyze_waste_image

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_image(request):
    """Analyze uploaded image and return fill level and priority"""
    try:
        image_file = request.FILES.get('image')
        complaint_type = request.data.get('complaint_type', 'overflowing')
        
        if not image_file:
            return Response({'success': False, 'error': 'No image provided'}, status=400)
        
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            for chunk in image_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        print(f"📸 Analyzing uploaded image: {image_file.name}")
        
        # Run ML detection
        result = analyze_waste_image(tmp_path, complaint_type, use_ml=True)
        
        # Clean up
        os.unlink(tmp_path)
        
        if result and result.get('success'):
            return Response({
                'success': True,
                'fill_level': result.get('fill_level', 50),
                'priority': result.get('priority', 'medium'),
                'confidence': result.get('confidence', 85),
                'recommendation': result.get('recommendation', ''),
                'method': result.get('method', 'ML Model'),
                'features': {
                    'brightness': result.get('brightness', 0),
                    'edge_density': result.get('edge_density', 0),
                    'texture': result.get('texture', 0)
                }
            })
        else:
            # Fallback analysis
            img = cv2.imread(tmp_path)
            if img is not None:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                brightness = np.mean(gray) / 255.0
                
                if brightness < 0.2:
                    fill_level = 90
                    priority = 'urgent'
                    recommendation = '🚨 Immediate collection required!'
                elif brightness < 0.35:
                    fill_level = 70
                    priority = 'high'
                    recommendation = '⚠️ Schedule within 24 hours'
                elif brightness < 0.6:
                    fill_level = 45
                    priority = 'medium'
                    recommendation = '📅 Schedule within 48 hours'
                else:
                    fill_level = 20
                    priority = 'low'
                    recommendation = '✅ Schedule within 72 hours'
                
                return Response({
                    'success': True,
                    'fill_level': fill_level,
                    'priority': priority,
                    'confidence': 70,
                    'recommendation': recommendation,
                    'method': 'Fallback'
                })
            
            return Response({
                'success': False,
                'error': result.get('error', 'Analysis failed')
            }, status=500)
            
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
