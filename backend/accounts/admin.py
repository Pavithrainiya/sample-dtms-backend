from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'name', 'role', 'is_staff']
    fieldsets = (
        ('User Profile', {'fields': ('username', 'name', 'role', 'phone_number', 'country', 'bio', 'skills', 'experience', 'resume')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

admin.site.register(User, CustomUserAdmin)
