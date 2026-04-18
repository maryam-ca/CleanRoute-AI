from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.core.management import call_command
from django.contrib.auth.models import User
from complaints.models import Complaint
from django.utils import timezone
import random

@api_view(['GET'])
@permission_classes([AllowAny])
def setup_database(request):
    """One-click database setup - creates tables and seed data"""
    
    # Run migrations
    call_command('migrate', verbosity=0)
    
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
    
    # Create sample complaints in Mehria Town, Attock
    mehria_coords = [
        (33.814890, 72.348424), (33.814060, 72.349107), (33.814301, 72.349665),
        (33.813543, 72.350030), (33.813459, 72.351639), (33.812157, 72.351564),
        (33.811381, 72.349215), (33.809857, 72.349365), (33.808252, 72.349655),
        (33.808216, 72.352219), (33.806594, 72.351511), (33.806910, 72.348550),
        (33.805965, 72.355588), (33.805162, 72.354901), (33.810600, 72.346404),
        (33.813649, 72.346726), (33.817722, 72.346500)
    ]
    
    priorities = ['urgent', 'high', 'medium', 'low']
    types = ['overflowing', 'missed', 'illegal', 'other']
    citizen = User.objects.get(username='citizen')
    
    created_complaints = 0
    for i, (lat, lng) in enumerate(mehria_coords):
        complaint, created = Complaint.objects.get_or_create(
            latitude=lat,
            longitude=lng,
            defaults={
                'complaint_type': random.choice(types),
                'description': f'Complaint in Mehria Town #{i+1}',
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
        'users_created': created_users,
        'complaints_created': created_complaints,
        'message': 'Database ready! You can now login.'
    })
