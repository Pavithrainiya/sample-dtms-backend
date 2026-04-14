from django.contrib import admin
from .models import Task, Submission

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'deadline', 'created_by', 'created_at')
    search_fields = ('title', 'description')

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'status', 'submitted_at')
    list_filter = ('status',)
    search_fields = ('user__email', 'task__title')
