from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ml_engine.enhanced_waste_detector import analyze_waste_image
import tempfile
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_image(request):
    """Analyze uploaded image and return ML detection results"""
    try:
        image_file = request.FILES.get('image')
        complaint_type = request.data.get('complaint_type')
        if not image_file:
            return Response({'success': False, 'error': 'No image provided'}, status=400)
        
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            for chunk in image_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        # Run ML detection
        result = analyze_waste_image(tmp_path, complaint_type)
        
        # Clean up
        os.unlink(tmp_path)
        
        if result and result.get('success'):
            return Response({
                'success': True,
                'fill_level': result.get('fill_level', 50),
                'priority': result.get('priority', 'medium'),
                'confidence': result.get('confidence', 75),
                'recommendation': result.get('recommendation', '')
            })
        else:
            return Response({
                'success': False,
                'error': 'ML analysis failed'
            }, status=500)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
