from django.urls import path
from . import views

urlpatterns = [
    path('setup/', views.setup_database, name='setup'),
    path('optimize-routes/', views.optimize_routes, name='optimize_routes'),
]
