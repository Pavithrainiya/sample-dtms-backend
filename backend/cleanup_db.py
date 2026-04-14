import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User
from django.db.models import Count

# 1. Convert all empty strings to None (NULL)
users_with_empty_phone = User.objects.filter(phone_number='')
count_empty = users_with_empty_phone.count()
if count_empty > 0:
    print(f"Updating {count_empty} users with empty phone number strings to NULL.")
    users_with_empty_phone.update(phone_number=None)

# 2. Check for remaining duplicates (non-null)
duplicates = User.objects.values('phone_number').annotate(count=Count('id')).filter(count__gt=1).exclude(phone_number=None)

if duplicates.exists():
    print("WARNING: Remaining duplicates found for phone numbers:")
    for dup in duplicates:
        print(f"Phone Number: {dup['phone_number']}, Count: {dup['count']}")
        # Find which users have this phone number
        users = User.objects.filter(phone_number=dup['phone_number'])
        for u in users:
            print(f"  - User: {u.email}")
else:
    print("No non-null duplicate phone numbers found. Ready for migration.")

