import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from complaints.models import Complaint
from django.contrib.auth.models import User

# Get or create citizen user
citizen, created = User.objects.get_or_create(
    username='citizen',
    defaults={'password': 'citizen123'}
)

# Add complaints for Attock
attock_locations = [
    (33.7667, 72.3667, "Saddar"),
    (33.7700, 72.3700, "Civil Lines"),
    (33.7750, 72.3750, "Kachehri"),
    (33.7800, 72.3700, "Shamsabad"),
    (33.7730, 72.3630, "Khan Market"),
    (33.7680, 72.3680, "GPO Chowk"),
]

current_count = Complaint.objects.filter(
    latitude__gt=33.6, latitude__lt=33.9,
    longitude__gt=72.1, longitude__lt=72.6
).count()

print(f'Current Attock complaints: {current_count}')

if current_count < 10:
    for i, (lat, lng, location) in enumerate(attock_locations):
        if current_count + i >= 10:
            break
        Complaint.objects.create(
            user=citizen,
            complaint_type=random.choice(['overflowing', 'spillage', 'missed']),
            priority=random.choice(['high', 'medium', 'low']),
            status='pending',
            latitude=lat + random.uniform(-0.003, 0.003),
            longitude=lng + random.uniform(-0.003, 0.003),
            description=f'Waste complaint in {location}, Attock',
            fill_level_before=random.randint(40, 95)
        )
        print(f'Added complaint in {location}')
    
    print('✅ Done! Refresh the Route Optimization page.')
else:
    print('Attock already has sufficient data')

print(f'Total Attock complaints now: {Complaint.objects.filter(latitude__gt=33.6, latitude__lt=33.9, longitude__gt=72.1, longitude__lt=72.6).count()}')
