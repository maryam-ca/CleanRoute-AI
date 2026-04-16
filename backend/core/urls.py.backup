from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('complaints.urls')),
    path('api/', include('users.urls')),
    path('api/', include('ml_engine.waste_prediction_api')),
    path('api/optimize-routes/', include('ml_engine.route_optimizer_api')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
