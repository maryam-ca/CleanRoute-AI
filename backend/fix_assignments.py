import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from complaints.models import Complaint
from django.contrib.auth.models import User
from django.utils import timezone

print("=" * 50)
print("FIXING COMPLAINT ASSIGNMENTS")
print("=" * 50)

# Get testers
testers = list(User.objects.filter(username__startswith='tester').order_by('id'))
print(f'Testers found: {[t.username for t in testers]}')

if not testers:
    print("No testers found! Creating testers...")
    for i in range(1, 6):
        User.objects.get_or_create(username=f'tester{i}', password='tester123')
    testers = list(User.objects.filter(username__startswith='tester').order_by('id'))
    print(f'Testers created: {[t.username for t in testers]}')

# Get all complaints
complaints = Complaint.objects.all()
print(f'Total complaints: {complaints.count()}')

# Reassign in round-robin
assigned_counts = {t.username: 0 for t in testers}
idx = 0

for complaint in complaints:
    if complaint.status != 'completed':
        tester = testers[idx % len(testers)]
        complaint.assigned_to = tester
        complaint.status = 'assigned'
        complaint.assigned_at = timezone.now()
        complaint.save()
        assigned_counts[tester.username] += 1
        print(f'✓ Complaint #{complaint.id} → {tester.username}')
        idx += 1

print(f'\n📊 Final Distribution:')
for tester, count in assigned_counts.items():
    print(f'  {tester}: {count} complaints')

print("\n✅ Assignment fix complete!")
