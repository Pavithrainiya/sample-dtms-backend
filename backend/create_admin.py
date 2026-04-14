import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    if not User.objects.filter(email='admin@example.com').exists():
        User.objects.create_superuser(
            email='admin@example.com',
            password='admin123password',
            username='admin_user',
            name='Global Administrator',
            role='Admin'
        )
        print("SUCCESS")
    else:
        print("EXISTS")
except Exception as e:
    print(f"ERROR: {e}")
