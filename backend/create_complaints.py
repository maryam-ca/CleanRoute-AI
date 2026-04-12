import random
from complaints.models import Complaint
from users.models import User

user = User.objects.get(username='testuser3')
print(f'Creating complaints for user: {user.username}')

for i in range(20):
    Complaint.objects.create(
        user=user,
        complaint_type=random.choice(['overflowing', 'spillage', 'missed', 'illegal', 'other']),
        priority=random.choice(['low', 'medium', 'high']),
        status=random.choice(['pending', 'in_progress', 'resolved']),
        latitude=33.6844 + random.uniform(-0.05, 0.05),
        longitude=73.0479 + random.uniform(-0.05, 0.05),
        description=f'Sample complaint {i+1}'
    )
print(f'Created 20 complaints for {user.username}')
print(f'Total complaints: {Complaint.objects.count()}')
