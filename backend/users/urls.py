from django.urls import path
from . import views

urlpatterns = [
    path('testers/', views.get_testers, name='testers'),
    path('all/', views.get_users, name='all_users'),
]
