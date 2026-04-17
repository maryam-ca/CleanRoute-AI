from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from complaints.models import Complaint
from sklearn.cluster import KMeans
import numpy as np
from math import radians, sin, cos, sqrt, atan2
from django.contrib.auth.models import User
from django.utils import timezone
import random

@api_view(['GET'])
@permission_classes([AllowAny])
def setup_database(request):
    """One-click setup - runs migrations and seeds data"""
    from django.core.management import call_command
    import sys
    from io import StringIO
    
    # Run migrations
    out = StringIO()
    call_command('migrate', verbosity=0, stdout=out)
    
    # Create users
    users_data = [
        ('admin', 'admin123', True),
        ('citizen', 'citizen123', False),
        ('tester1', 'tester123', False),
        ('tester2', 'tester123', False),
        ('tester3', 'tester123', False),
        ('tester4', 'tester123', False),
        ('tester5', 'tester123', False),
    ]
    
    created_users = []
    for username, password, is_admin in users_data:
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.set_password(password)
            if is_admin:
                user.is_staff = True
                user.is_superuser = True
            user.save()
            created_users.append(username)
    
    # Create sample complaints in Attock area
    attock_coords = [
        (33.81489, 72.348424), (33.81406, 72.349107), (33.814301, 72.349665),
        (33.813543, 72.35003), (33.813459, 72.351639), (33.812157, 72.351564),
        (33.811381, 72.349215), (33.809857, 72.349365), (33.808252, 72.349655),
        (33.808216, 72.352219), (33.806594, 72.351511), (33.80691, 72.34855),
    ]
    
    priorities = ['urgent', 'high', 'medium', 'low']
    types = ['overflowing', 'spillage', 'missed', 'illegal']
    citizen = User.objects.get(username='citizen')
    
    created_complaints = 0
    for i, (lat, lng) in enumerate(attock_coords[:8]):
        complaint, created = Complaint.objects.get_or_create(
            latitude=lat,
            longitude=lng,
            defaults={
                'complaint_type': random.choice(types),
                'description': f'Test complaint {i+1} in Attock',
                'priority': random.choice(priorities),
                'fill_level_before': random.randint(40, 95),
                'status': 'assigned',
                'user': citizen,
                'created_at': timezone.now()
            }
        )
        if created:
            created_complaints += 1
    
    return JsonResponse({
        'status': 'success',
        'migrations': 'completed',
        'users_created': created_users,
        'complaints_created': created_complaints,
        'message': 'Database ready! You can now login.'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    # Your existing optimize_routes code here
    return JsonResponse({'success': True, 'routes': []})
