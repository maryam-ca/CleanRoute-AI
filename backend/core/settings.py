from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-cleanroute-ai-2024-production-key'
DEBUG = False

ALLOWED_HOSTS = ['.onrender.com', 'localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'channels',
    'complaints',
    'users',
    'ml_engine',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [BASE_DIR / 'templates'],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    }
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = []
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Karachi'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'https://cleanroute-ai-prod.vercel.app',
    'http://localhost:3000',
]

CSRF_TRUSTED_ORIGINS = [
    'https://cleanroute-ai-prod.vercel.app',
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your_email@gmail.com'
EMAIL_HOST_PASSWORD = 'your_app_password'
DEFAULT_FROM_EMAIL = 'CleanRoute-AI <noreply@cleanroute-ai.com>'

DATA_UPLOAD_MAX_NUMBER_FILES = 100
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760


# ============================================
# AUTO-SEED DATABASE ON STARTUP (FIXED)
# ============================================
import sys
if 'gunicorn' in sys.argv[0] or 'runserver' in sys.argv:
    try:
        from django.contrib.auth.models import User
        from complaints.models import Complaint
        from django.utils import timezone
        import random
        
        print("🌱 Auto-seeding database on startup...")
        
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
                print(f"  ✅ Created user: {username}")
        
        # All complaint coordinates
        all_coords = [
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
        
        # Delete existing complaints and create fresh
        Complaint.objects.all().delete()
        print(f"  ✅ Deleted old complaints")
        
        citizen = User.objects.get(username='citizen')
        types = ['overflowing', 'spillage', 'missed', 'illegal']
        priorities = ['urgent', 'high', 'medium', 'low']
        
        for i, (lat, lng) in enumerate(all_coords):
            Complaint.objects.create(
                complaint_type=random.choice(types),
                latitude=lat,
                longitude=lng,
                description=f'Complaint in Attock #{i+1}',
                priority=random.choice(priorities),
                fill_level_before=random.randint(30, 90),
                status='assigned',
                user=citizen,
                created_at=timezone.now()
            )
        
        print(f"  ✅ Created {len(all_coords)} complaints")
        print("🎉 Auto-seed complete!")
        
    except Exception as e:
        print(f"⚠️ Auto-seed error: {e}")
