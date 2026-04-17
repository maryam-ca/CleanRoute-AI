from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .advanced_waste_predictor import advanced_predictor
from .waste_predictor import WastePredictor

# Simple predictor instance
simple_predictor = WastePredictor()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict_waste(request):
    """Simple waste prediction (legacy)"""
    try:
        days = int(request.GET.get('days', 7))
        days = min(days, 30)
        
        forecast = simple_predictor.predict_future(days)
        result = simple_predictor.get_forecast(days)
        
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
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict_waste_advanced(request):
    """Advanced waste prediction with ensemble models"""
    try:
        days = int(request.GET.get('days', 7))
        days = min(days, 30)
        
        # Train models if not already trained
        try:
            result = advanced_predictor.get_forecast(days)
        except:
            advanced_predictor.train()
            result = advanced_predictor.get_forecast(days)
        
        return JsonResponse({
            'success': True,
            'forecast': result['forecast'],
            'confidence_intervals': result.get('confidence_intervals', []),
            'days': days,
            'total': result['total'],
            'average': result['average'],
            'peak': result['peak'],
            'peak_day': result['peak_day'],
            'unit': 'tons',
            'model_performance': result.get('model_performance', {}),
            'model_weights': result.get('model_weights', {}),
            'method': 'Ensemble (Linear + Ridge + Random Forest + Gradient Boosting)'
        })
    except Exception as e:
        print(f"Advanced prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e), 'fallback': True}, status=500)
