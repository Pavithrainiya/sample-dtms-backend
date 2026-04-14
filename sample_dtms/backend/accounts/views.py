from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Count, Case, When, IntegerField
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        # Serialize user data
        user_data = UserSerializer(user, context=self.get_serializer_context()).data
        return Response({
            "user": user_data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=201)

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Base queryset
        queryset = User.objects.all()
        
        # Only admins should see all users with their stats
        if self.request.user.role == 'Admin':
            return queryset.annotate(
                approved_count=Count(
                    Case(When(my_submissions__status='Reviewed', then=1), output_field=IntegerField())
                ),
                rejected_count=Count(
                    Case(When(my_submissions__status='Rejected', then=1), output_field=IntegerField())
                ),
                pending_count=Count(
                    Case(When(my_submissions__status='Submitted', then=1), output_field=IntegerField())
                )
            ).order_by('-date_joined')
            
        return queryset.filter(id=self.request.user.id)
