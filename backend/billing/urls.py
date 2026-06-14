from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HourPackageViewSet, ChildHourBalanceViewSet, HourPurchaseViewSet

router = DefaultRouter()
router.register('packages', HourPackageViewSet, basename='hour-package')
router.register('balances', ChildHourBalanceViewSet, basename='child-hour-balance')
router.register('purchases', HourPurchaseViewSet, basename='hour-purchase')

urlpatterns = [
    path('', include(router.urls)),
]
