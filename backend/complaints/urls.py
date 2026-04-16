from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import anomaly_views

router = DefaultRouter()
router.register(r'complaints', views.ComplaintViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('anomalies/', anomaly_views.get_anomalies, name='anomalies'),
]
