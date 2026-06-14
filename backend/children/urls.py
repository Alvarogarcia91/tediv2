from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParentProfileViewSet, ChildViewSet

router = DefaultRouter()
router.register('parents', ParentProfileViewSet, basename='parent-profile')
router.register('children', ChildViewSet, basename='child')

urlpatterns = [
    path('', include(router.urls)),
]
