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
        (33.814890, 72.348424), (33.813543, 72.350030), (33.813459, 72.351639),
            (33.809857, 72.349365), (33.808216, 72.352219), (33.806910, 72.348550),
            (33.805162, 72.354901), (33.817722, 72.346500),
            (33.813853, 72.363587), (33.813425, 72.367106), (33.810929, 72.367449),
            (33.809004, 72.365904), (33.809004, 72.362986),
            (33.797640, 72.353540), (33.795522, 72.353783), (33.797489, 72.352448),
            (33.797691, 72.353540),
            (33.790730, 72.358274), (33.789116, 72.358274), (33.789570, 72.356271),
            (33.790730, 72.355968),
            (33.789270, 72.360618), (33.788011, 72.361268), (33.785551, 72.361773),
            (33.784913, 72.359719), (33.784489, 72.358291),
            (33.782983, 72.352628), (33.782653, 72.350192), (33.782353, 72.351202),
            (33.781393, 72.350896), (33.779728, 72.352086), (33.780823, 72.352068),
            (33.779683, 72.353151), (33.781633, 72.349849)
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
