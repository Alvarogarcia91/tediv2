from rest_framework import serializers
from .models import HourPackage, ChildHourBalance, HourPurchase


class HourPackageSerializer(serializers.ModelSerializer):
    minutes = serializers.ReadOnlyField()

    class Meta:
        model = HourPackage
        fields = [
            'id', 'name', 'description', 'hours', 'minutes', 'price',
            'is_active', 'sort_order', 'created_at', 'updated_at'
        ]


class ChildHourBalanceSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.full_name')
    available_hours = serializers.SerializerMethodField()
    total_purchased_hours = serializers.SerializerMethodField()
    total_consumed_hours = serializers.SerializerMethodField()

    class Meta:
        model = ChildHourBalance
        fields = [
            'id', 'child', 'child_name', 'available_minutes', 'available_hours',
            'total_purchased_minutes', 'total_purchased_hours',
            'total_consumed_minutes', 'total_consumed_hours', 'updated_at'
        ]

    def get_available_hours(self, obj):
        return round(obj.available_minutes / 60.0, 2)

    def get_total_purchased_hours(self, obj):
        return round(obj.total_purchased_minutes / 60.0, 2)

    def get_total_consumed_hours(self, obj):
        return round(obj.total_consumed_minutes / 60.0, 2)


class HourPurchaseSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.full_name')
    package_name = serializers.ReadOnlyField(source='package.name')
    purchased_hours = serializers.SerializerMethodField()

    class Meta:
        model = HourPurchase
        fields = [
            'id', 'child', 'child_name', 'package', 'package_name',
            'purchased_minutes', 'purchased_hours', 'amount', 'payment_status',
            'payment_method', 'payment_reference', 'notes', 'purchased_at',
            'created_by', '_balance_credited', 'created_at', 'updated_at'
        ]
        read_only_fields = ['_balance_credited']

    def get_purchased_hours(self, obj):
        return round(obj.purchased_minutes / 60.0, 2)
