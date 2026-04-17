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
# AUTO-SEED DATABASE ON STARTUP (for Render free tier)
# ============================================
import sys
if 'gunicorn' in sys.argv[0] or 'runserver' in sys.argv:
    try:
        from django.contrib.auth.models import User
        from complaints.models import Complaint
        from django.utils import timezone
        import random
        
        # Check if database is empty
        if User.objects.count() == 0:
            print("🌱 Seeding database on startup...")
            
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
                user = User.objects.create_user(username=username, password=password)
                if is_admin:
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                print(f"  ✅ Created user: {username}")
            
            # Create sample complaints
            attock_coords = [
                (33.81489, 72.348424), (33.81406, 72.349107), (33.814301, 72.349665),
                (33.813543, 72.35003), (33.813459, 72.351639), (33.812157, 72.351564),
                (33.811381, 72.349215), (33.809857, 72.349365), (33.808252, 72.349655),
                (33.808216, 72.352219), (33.806594, 72.351511), (33.80691, 72.34855),
            ]
            
            citizen = User.objects.get(username='citizen')
            priorities = ['urgent', 'high', 'medium', 'low']
            types = ['overflowing', 'spillage', 'missed', 'illegal']
            
            for i, (lat, lng) in enumerate(attock_coords[:8]):
                Complaint.objects.create(
                    complaint_type=random.choice(types),
                    latitude=lat,
                    longitude=lng,
                    description=f'Test complaint {i+1} in Attock',
                    priority=random.choice(priorities),
                    fill_level_before=random.randint(40, 95),
                    status='assigned',
                    user=citizen,
                    created_at=timezone.now()
                )
                print(f"  ✅ Created complaint {i+1}")
            
            print("🎉 Database seeding complete!")
    except Exception as e:
        print(f"⚠️ Auto-seed error: {e}")
