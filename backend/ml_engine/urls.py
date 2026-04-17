from django.urls import path
from . import views
from . import waste_prediction_api

urlpatterns = [
    path('migrate/', run_migrations, name='migrate'),
    path('optimize-routes/', views.optimize_routes, name='optimize_routes'),
    path('predict-waste/', waste_prediction_api.predict_waste, name='predict_waste'),
]


    


