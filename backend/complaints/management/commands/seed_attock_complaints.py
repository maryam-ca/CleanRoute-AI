import random

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from complaints.models import Complaint


ALL_COORDS = [
    (33.814890, 72.348424),
    (33.813543, 72.350030),
    (33.813459, 72.351639),
    (33.809857, 72.349365),
    (33.808216, 72.352219),
    (33.806910, 72.348550),
    (33.805162, 72.354901),
    (33.817722, 72.346500),
    (33.813853, 72.363587),
    (33.813425, 72.367106),
    (33.810929, 72.367449),
    (33.809004, 72.365904),
    (33.809004, 72.362986),
    (33.797640, 72.353540),
    (33.795522, 72.353783),
    (33.797489, 72.352448),
    (33.797691, 72.353540),
    (33.790730, 72.358274),
    (33.789116, 72.358274),
    (33.789570, 72.356271),
    (33.790730, 72.355968),
    (33.789270, 72.360618),
    (33.788011, 72.361268),
    (33.785551, 72.361773),
    (33.784913, 72.359719),
    (33.784489, 72.358291),
    (33.782983, 72.352628),
    (33.782653, 72.350192),
    (33.782353, 72.351202),
    (33.781393, 72.350896),
    (33.779728, 72.352086),
    (33.780823, 72.352068),
    (33.779683, 72.353151),
    (33.781633, 72.349849),
]

USERS = [
    ("admin", "admin123", True),
    ("citizen", "citizen123", False),
    ("tester1", "tester123", False),
    ("tester2", "tester123", False),
    ("tester3", "tester123", False),
    ("tester4", "tester123", False),
    ("tester5", "tester123", False),
]


class Command(BaseCommand):
    help = "Seed Attock complaint data if it is missing"

    def handle(self, *args, **options):
        self._ensure_users()
        created_count = self._ensure_complaints()
        total_count = Complaint.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Attock seed complete. Created {created_count} complaints. Total complaints: {total_count}."
            )
        )

    def _ensure_users(self):
        for username, password, is_admin in USERS:
            user, created = User.objects.get_or_create(username=username)
            if created or not user.has_usable_password():
                user.set_password(password)
            if is_admin:
                user.is_staff = True
                user.is_superuser = True
            user.save()

    def _ensure_complaints(self):
        citizen = User.objects.get(username="citizen")
        priorities = ["urgent", "high", "medium", "low"]
        complaint_types = ["overflowing", "spillage", "missed", "illegal"]
        created_count = 0

        for index, (lat, lng) in enumerate(ALL_COORDS, start=1):
            complaint, created = Complaint.objects.get_or_create(
                latitude=lat,
                longitude=lng,
                defaults={
                    "complaint_type": random.choice(complaint_types),
                    "description": f"Complaint #{index} in Attock",
                    "priority": random.choice(priorities),
                    "fill_level_before": random.randint(40, 95),
                    "status": "pending",
                    "user": citizen,
                    "created_at": timezone.now(),
                },
            )
            if created:
                created_count += 1
            elif not complaint.user_id:
                complaint.user = citizen
                complaint.save(update_fields=["user"])

        return created_count
