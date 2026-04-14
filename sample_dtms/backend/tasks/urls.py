from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, SubmissionViewSet, DashboardStatsView, MissionAnalystView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('ai-analyst/', MissionAnalystView.as_view(), name='ai-analyst'),
]
