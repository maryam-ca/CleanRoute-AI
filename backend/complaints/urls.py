from django.urls import path
from . import views

urlpatterns = [
    path('', views.submit_complaint, name='submit_complaint'),
    path('', views.optimize_routes, name='optimize_routes'),
    path('', views.predict_waste_areas, name='predict_waste'),
]