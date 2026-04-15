from django.urls import path
from . import route_optimizer_api

urlpatterns = [
    path('', route_optimizer_api.optimize_routes, name='optimize_routes'),
]
