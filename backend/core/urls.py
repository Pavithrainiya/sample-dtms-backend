from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import get_user_model

# Function to check admin status
def check_admin_status(request):
    User = get_user_model()
    admin_users = User.objects.filter(is_superuser=True).values('username', 'email')
    return JsonResponse({
        'admin_exists': admin_users.exists(),
        'admins': list(admin_users)
    })

# Temporary admin creation endpoint - REMOVE AFTER USE
def setup_admin(request):
    User = get_user_model()
    username = 'admin'
    email = 'admin@example.com'
    password = 'Admin@123456'
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        return HttpResponse("✅ Admin user CREATED!<br>Username: admin<br>Password: Admin@123456<br><br>Now go to <a href='/admin/'>/admin/</a> to login.")
    else:
        return HttpResponse("⚠️ Admin user ALREADY EXISTS.<br><br>Go to <a href='/admin/'>/admin/</a> to login.")

urlpatterns = [
    path('setup-admin/', setup_admin),  # Temporary - REMOVE AFTER USE
    path('admin/', admin.site.urls),
    path('api/check-admin/', check_admin_status),
    path('api/auth/', include('accounts.urls')),
    path('api/tasks/', include('tasks.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)