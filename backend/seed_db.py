import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from complaints.models import Complaint
from django.utils import timezone
import random

print("🌱 Seeding database...")

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

for username, password, is_admin in users_data:
    user, created = User.objects.get_or_create(username=username)
    if created:
        user.set_password(password)
        if is_admin:
            user.is_staff = True
            user.is_superuser = True
        user.save()
        print(f"✅ Created user: {username}")

# Create sample complaints in Attock area
attock_coords = [
    (33.81489, 72.348424), (33.81406, 72.349107), (33.814301, 72.349665),
    (33.813543, 72.35003), (33.813459, 72.351639), (33.812157, 72.351564),
    (33.811381, 72.349215), (33.809857, 72.349365), (33.808252, 72.349655),
    (33.808216, 72.352219), (33.806594, 72.351511), (33.80691, 72.34855),
]

priorities = ['urgent', 'high', 'medium', 'low']
complaint_types = ['overflowing', 'spillage', 'missed', 'illegal']

citizen = User.objects.get(username='citizen')

for i, (lat, lng) in enumerate(attock_coords[:10]):
    Complaint.objects.get_or_create(
        complaint_type=random.choice(complaint_types),
        latitude=lat,
        longitude=lng,
        defaults={
            'description': f'Test complaint {i+1} in Attock',
            'priority': random.choice(priorities),
            'fill_level_before': random.randint(30, 95),
            'status': 'assigned',
            'user': citizen,
            'created_at': timezone.now()
        }
    )
    print(f"✅ Created complaint {i+1}")

print("🎉 Database seeding complete!")
