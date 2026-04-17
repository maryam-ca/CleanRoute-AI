import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from complaints.models import Complaint
from django.contrib.auth.models import User
from django.utils import timezone

print("Fixing assignments...")

# Get testers
testers = list(User.objects.filter(username__startswith='tester'))
print(f"Testers: {[t.username for t in testers]}")

# Assign all complaints in round-robin
complaints = Complaint.objects.exclude(status='completed')
testers_count = len(testers)
for i, complaint in enumerate(complaints):
    tester = testers[i % testers_count]
    complaint.assigned_to = tester
    complaint.status = 'assigned'
    complaint.assigned_at = timezone.now()
    complaint.save()
    print(f"Assigned complaint #{complaint.id} to {tester.username}")

print("Done!")
