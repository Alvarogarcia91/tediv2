from django.contrib import admin
from .models import HourPackage, ChildHourBalance, HourPurchase


@admin.register(HourPackage)
class HourPackageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'hours', 'minutes', 'price', 'is_active', 'sort_order')
    search_fields = ('name',)
    list_filter = ('is_active',)


@admin.register(ChildHourBalance)
class ChildHourBalanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'child', 'available_minutes', 'total_purchased_minutes', 'total_consumed_minutes', 'updated_at')
    search_fields = ('child__first_name', 'child__last_name')


@admin.register(HourPurchase)
class HourPurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'child', 'package', 'purchased_minutes', 'amount', 'payment_status', 'payment_method', '_balance_credited', 'purchased_at')
    search_fields = ('child__first_name', 'child__last_name', 'payment_reference')
    list_filter = ('payment_status', 'payment_method', '_balance_credited')
    readonly_fields = ('_balance_credited',)
