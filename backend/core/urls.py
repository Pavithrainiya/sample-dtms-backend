from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.contrib.auth import get_user_model

# Add this function to check admin status
def check_admin_status(request):
    User = get_user_model()
    admin_users = User.objects.filter(is_superuser=True).values('username', 'email')
    return JsonResponse({
        'admin_exists': admin_users.exists(),
        'admins': list(admin_users)
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/check-admin/', check_admin_status),  # ← Add this line
    path('api/auth/', include('accounts.urls')),
    path('api/tasks/', include('tasks.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)