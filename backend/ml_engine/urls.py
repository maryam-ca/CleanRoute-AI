from django.urls import path
from . import waste_prediction_api
from . import views

urlpatterns = [
    path('predict-waste/', waste_prediction_api.predict_waste, name='predict_waste'),
    path('optimize-routes/', views.optimize_routes, name='optimize_routes'),
]
