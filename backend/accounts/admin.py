from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_parent', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Fields', {'fields': ('is_parent', 'last_login_ip')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Fields', {'fields': ('is_parent', 'last_login_ip')}),
    )


admin.site.register(User, CustomUserAdmin)
