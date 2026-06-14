from django.urls import path
from .views import list_records, check_in_view, check_out_view, cancel_view, settings_view

urlpatterns = [
    path('records/', list_records, name='attendance_records'),
    path('check-in/', check_in_view, name='attendance_check_in'),
    path('check-out/', check_out_view, name='attendance_check_out'),
    path('cancel/', cancel_view, name='attendance_cancel'),
    path('settings/', settings_view, name='attendance_settings'),
]
