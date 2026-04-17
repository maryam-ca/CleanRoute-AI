import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from complaints.models import Complaint

print("🚀 Running migrations...")
from django.core.management import call_command
call_command('migrate', verbosity=0)

print("✅ Migrations complete!")

# Create users
users = [
    ('admin', 'admin123', True),
    ('citizen', 'citizen123', False),
    ('tester1', 'tester123', False),
    ('tester2', 'tester123', False),
    ('tester3', 'tester123', False),
    ('tester4', 'tester123', False),
    ('tester5', 'tester123', False),
]

for username, password, is_admin in users:
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(username=username, password=password)
        if is_admin:
            user.is_staff = True
            user.is_superuser = True
            user.save()
        print(f"✅ Created user: {username}")

print("🎉 Database setup complete!")