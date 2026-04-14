import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

print("=" * 60)
print("PASSWORD RESET TOOL")
print("=" * 60)

email = input("\nEnter user email: ").strip()
new_password = input("Enter new password: ").strip()

try:
    user = User.objects.get(email=email)
    user.set_password(new_password)
    user.save()
    
    print(f"\n✅ Password updated successfully!")
    print(f"\nUser: {user.name} ({user.email})")
    print(f"New password: {new_password}")
    print(f"\nYou can now login with these credentials.")
    
except User.DoesNotExist:
    print(f"\n❌ User with email '{email}' not found!")
    print("\nAvailable users:")
    for u in User.objects.all()[:10]:
        print(f"  - {u.email}")
except Exception as e:
    print(f"\n❌ Error: {e}")
