import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

print("=" * 60)
print("ALL USERS IN DATABASE")
print("=" * 60)

users = User.objects.all()

if users.count() == 0:
    print("\n❌ NO USERS FOUND IN DATABASE!")
    print("\nYou need to create a user first.")
    print("\nOptions:")
    print("1. Register via the frontend")
    print("2. Run: python setup_demo_data.py")
else:
    print(f"\nTotal users: {users.count()}\n")
    for user in users:
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Name: {user.name}")
        print(f"Role: {user.role}")
        print(f"Active: {user.is_active}")
        print("-" * 60)
