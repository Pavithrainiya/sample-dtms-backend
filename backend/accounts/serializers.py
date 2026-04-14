from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password', 'role', 'phone_number', 'country', 'skills', 'experience', 'resume')
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            name=validated_data.get('name', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'User'),
            phone_number=validated_data.get('phone_number', ''),
            country=validated_data.get('country', ''),
            skills=validated_data.get('skills', ''),
            experience=validated_data.get('experience', ''),
            resume=validated_data.get('resume', None)
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    approved_count = serializers.IntegerField(read_only=True)
    rejected_count = serializers.IntegerField(read_only=True)
    pending_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'bio', 'phone_number', 'country', 'skills', 'experience', 'resume', 'approved_count', 'rejected_count', 'pending_count')
