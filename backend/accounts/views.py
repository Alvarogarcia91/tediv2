from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_data(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "roles": [group.name for group in user.groups.all()],
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "is_parent": user.is_parent,
    }


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    Endpoint to get CSRF token and set it in a cookie.
    """
    # ensure_csrf_cookie decorator guarantees the CSRF cookie is set
    return Response({"detail": "CSRF cookie set"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login endpoint using Django Session Authentication.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"detail": "Both username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Update last login IP
        user.last_login_ip = get_client_ip(request)
        user.save()
        return Response(get_user_data(user), status=status.HTTP_200_OK)
    else:
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
def logout_view(request):
    """
    Logout endpoint.
    """
    logout(request)
    return Response({"detail": "Logged out"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def me_view(request):
    """
    Returns data of currently authenticated user.
    """
    if request.user.is_authenticated:
        return Response(get_user_data(request.user), status=status.HTTP_200_OK)
    return Response(
        {"detail": "Authentication credentials were not provided."},
        status=status.HTTP_401_UNAUTHORIZED
    )
