from django.urls import path
from . import image_analysis_views

urlpatterns = [
    path('', image_analysis_views.analyze_image, name='analyze_image'),
]
