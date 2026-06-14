from django.urls import path
from .views import get_csrf_token, login_view, logout_view, me_view

urlpatterns = [
    path('csrf/', get_csrf_token, name='auth_csrf'),
    path('login/', login_view, name='auth_login'),
    path('logout/', logout_view, name='auth_logout'),
    path('me/', me_view, name='auth_me'),
]
