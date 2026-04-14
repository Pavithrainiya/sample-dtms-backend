import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User
from tasks.models import Task

print("=" * 60)
print("DTMS DEMO DATA SETUP")
print("=" * 60)

# Create Admin if doesn't exist
admin_email = 'admin@example.com'
if not User.objects.filter(email=admin_email).exists():
    admin = User.objects.create_superuser(
        email=admin_email,
        username='admin_user',
        name='System Administrator',
        password='admin123password',
        role='Admin'
    )
    print(f"\n✅ Admin created: {admin_email}")
    print(f"   Password: admin123password")
else:
    admin = User.objects.get(email=admin_email)
    print(f"\n✅ Admin already exists: {admin_email}")

# Create demo tasks
demo_tasks = [
    {
        'title': 'Complete Python Assignment',
        'description': 'Write a Python script that processes CSV data and generates a report. Include proper error handling and documentation.',
        'deadline': datetime.now() + timedelta(days=7)
    },
    {
        'title': 'Design Landing Page',
        'description': 'Create a modern landing page design for our new product. Submit mockups in PNG or Figma format.',
        'deadline': datetime.now() + timedelta(days=5)
    },
    {
        'title': 'Database Schema Design',
        'description': 'Design a database schema for the e-commerce platform. Submit an ER diagram and SQL scripts.',
        'deadline': datetime.now() + timedelta(days=10)
    }
]

created_count = 0
for task_data in demo_tasks:
    if not Task.objects.filter(title=task_data['title']).exists():
        task = Task.objects.create(
            title=task_data['title'],
            description=task_data['description'],
            deadline=task_data['deadline'],
            created_by=admin
        )
        # Assign to all users
        all_users = User.objects.filter(role='User')
        task.assigned_users.set(all_users)
        created_count += 1
        print(f"\n✅ Task created: {task.title}")
        print(f"   Assigned to {all_users.count()} users")
    else:
        print(f"\n⚠️  Task already exists: {task_data['title']}")

print("\n" + "=" * 60)
print(f"SETUP COMPLETE!")
print("=" * 60)
print(f"\nCreated {created_count} new tasks")
print(f"Total tasks in system: {Task.objects.count()}")
print(f"Total users: {User.objects.count()}")

print("\n📋 LOGIN CREDENTIALS:")
print("-" * 60)
print("ADMIN:")
print(f"  Email: {admin_email}")
print(f"  Password: admin123password")
print("\nUSERS:")
for user in User.objects.filter(role='User')[:5]:
    print(f"  Email: {user.email}")
print("\n" + "=" * 60)
print("🚀 You can now login and see tasks!")
print("=" * 60)
