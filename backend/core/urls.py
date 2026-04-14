from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.contrib.auth import get_user_model

# Simple admin creation view
def create_admin_user(request):
    try:
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True
            }
        )
        if created:
            user.set_password('Admin@123456')
            user.save()
            return HttpResponse("✅ Admin user created!<br><br>Username: admin<br>Password: Admin@123456<br><br><a href='/admin/'>Click here to login</a>")
        else:
            return HttpResponse("⚠️ Admin user already exists!<br><br><a href='/admin/'>Click here to login</a>")
    except Exception as e:
        return HttpResponse(f"Error: {e}")

urlpatterns = [
    path('create-admin/', create_admin_user),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/tasks/', include('tasks.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)