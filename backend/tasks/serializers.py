from rest_framework import serializers
from .models import Task, Submission
from accounts.serializers import UserSerializer

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'deadline', 'created_by', 'created_at', 'attachment', 'assigned_users')
        read_only_fields = ('created_by', 'created_at')

class SubmissionSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    task_details = TaskSerializer(source='task', read_only=True)

    class Meta:
        model = Submission
        fields = ('id', 'task', 'user', 'content', 'status', 'submitted_at', 'user_details', 'task_details', 'attachment')
        read_only_fields = ('user', 'status', 'submitted_at')
