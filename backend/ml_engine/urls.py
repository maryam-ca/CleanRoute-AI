from django.urls import path
from . import views
from . import setup_view

urlpatterns = [
    path('setup/', views.setup_database, name='setup'),
    path('optimize-routes/', views.optimize_routes, name='optimize_routes'),
]

