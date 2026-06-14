from django.contrib import admin
from .models import AttendanceSettings, AttendanceRecord


@admin.register(AttendanceSettings)
class AttendanceSettingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'default_tolerance_minutes', 'updated_at')


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'child', 'status', 'checked_in_at', 'checked_out_at', 'raw_minutes', 'billable_minutes', 'uncovered_minutes')
    search_fields = ('child__first_name', 'child__last_name', 'notes')
    list_filter = ('status',)
