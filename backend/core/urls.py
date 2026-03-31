from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from complaints import views

urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),
    path('api/submit-complaint/', views.submit_complaint, name='submit_complaint'),
    path('api/optimize-routes/', views.optimize_routes, name='optimize_routes'),
    path('api/predict-waste/', views.predict_waste_areas, name='predict_waste'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)