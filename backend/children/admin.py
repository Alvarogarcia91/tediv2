from django.contrib import admin
from .models import ParentProfile, Child


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'phone', 'whatsapp', 'is_active', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone')
    list_filter = ('is_active',)


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'date_of_birth', 'age', 'unique_code', 'is_active')
    search_fields = ('first_name', 'last_name', 'unique_code')
    list_filter = ('is_active',)
    filter_horizontal = ('parent_profiles',)
