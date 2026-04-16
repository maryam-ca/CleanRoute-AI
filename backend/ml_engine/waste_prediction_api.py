from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .gis_service import gis_service
from .weather_service import weather_service
from .waste_predictor import WastePredictor
import numpy as np
from datetime import datetime, timedelta

predictor = WastePredictor()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict_waste(request):
    """Enhanced waste prediction with GIS and weather data"""
    days = int(request.query_params.get('days', 7))
    area = request.query_params.get('area', 'Islamabad')
    days = min(days, 30)

    # Get GIS data for the area
    gis_data = gis_service.get_waste_prediction_factors(area)

    # Get weather forecast
    weather_forecast = weather_service.get_forecast(days)

    base_predictions = predictor.predict_future(days)

    predictions = []

    for i, forecast in enumerate(weather_forecast):
        date = (datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d')

        predicted = base_predictions[i]

        # Weather factor (rain increases waste collection issues)
        weather_factor = 1 + (forecast['rain'] / 20)

        # Temperature factor (higher temp = more waste)
        temp_factor = 1 + (max(0, forecast['temperature'] - 20) / 50)

        # Day of week factor (weekends = higher waste)
        day_of_week = (datetime.now() + timedelta(days=i+1)).weekday()
        if day_of_week >= 5:
            day_factor = 1.15
        elif day_of_week == 0:
            day_factor = 1.2
        else:
            day_factor = 1.0

        # Population density factor
        density_factor = max(0.9, min(1.35, gis_data['density_factor'] / 4))

        predicted = predicted * weather_factor * temp_factor * day_factor * density_factor
        predicted = max(5, round(predicted, 1))

        predictions.append({
            'date': date,
            'predicted': predicted,
            'lower': round(max(0, predicted * 0.92), 1),
            'upper': round(predicted * 1.08, 1),
            'factors': {
                'weather': round(weather_factor, 2),
                'temperature': round(temp_factor, 2),
                'day_factor': round(day_factor, 2),
                'density_factor': round(density_factor, 2)
            }
        })

    return Response({
        'predictions': predictions,
        'area': area,
        'gis_data': gis_data,
        'model': 'Linear Regression + GIS + Weather',
        'rmse': predictor.metrics.get('rmse'),
        'r2': predictor.metrics.get('r2'),
        'data_source': predictor.metrics.get('source')
    })

# URL patterns for this view
urlpatterns = [
    path('predict-waste/', predict_waste, name='predict_waste'),
]
