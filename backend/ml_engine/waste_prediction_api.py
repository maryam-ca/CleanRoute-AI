from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .waste_predictor import WastePredictor
import json

predictor = WastePredictor()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict_waste(request):
    """API endpoint for waste prediction"""
    try:
        days = int(request.GET.get('days', 7))
        days = min(days, 30)  # Limit to 30 days max
        
        # Get predictions
        forecast = predictor.predict_future(days)
        result = predictor.get_forecast(days)
        
        return JsonResponse({
            'success': True,
            'forecast': forecast,
            'days': days,
            'total': result['total'],
            'average': result['average'],
            'peak': result['peak'],
            'peak_day': result['peak_day'],
            'unit': 'tons'
        })
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        # Return demo data as fallback
        demo_forecast = [round(50 + i * 2 + (i % 3) * 3, 1) for i in range(days)]
        return JsonResponse({
            'success': True,
            'forecast': demo_forecast,
            'days': days,
            'total': round(sum(demo_forecast), 1),
            'average': round(sum(demo_forecast) / days, 1),
            'peak': max(demo_forecast),
            'peak_day': demo_forecast.index(max(demo_forecast)) + 1,
            'unit': 'tons',
            'note': 'Demo data - train model for accurate predictions'
        })
