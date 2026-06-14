from rest_framework import serializers
from .models import AttendanceSettings, AttendanceRecord


class AttendanceSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSettings
        fields = ['id', 'default_tolerance_minutes', 'updated_at']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.full_name')
    checked_in_by_name = serializers.SerializerMethodField()
    checked_out_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'child', 'child_name', 'checked_in_at', 'checked_out_at',
            'status', 'raw_minutes', 'billable_minutes', 'tolerance_minutes',
            'uncovered_minutes', 'notes', 'checked_in_by', 'checked_in_by_name',
            'checked_out_by', 'checked_out_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'checked_in_at', 'checked_out_at', 'status', 'raw_minutes',
            'billable_minutes', 'tolerance_minutes', 'uncovered_minutes',
            'checked_in_by', 'checked_out_by'
        ]

    def get_checked_in_by_name(self, obj):
        return obj.checked_in_by.get_full_name() or obj.checked_in_by.username if obj.checked_in_by else None

    def get_checked_out_by_name(self, obj):
        return obj.checked_out_by.get_full_name() or obj.checked_out_by.username if obj.checked_out_by else None
