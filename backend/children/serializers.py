from rest_framework import serializers
from .models import ParentProfile, Child


class ParentProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = ParentProfile
        fields = [
            'id', 'user', 'user_email', 'user_full_name', 'phone', 'whatsapp',
            'emergency_contact_name', 'emergency_contact_phone', 'address', 'notes',
            'is_active', 'created_at', 'updated_at'
        ]

    def get_user_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class ChildSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()

    class Meta:
        model = Child
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'date_of_birth', 'age',
            'unique_code', 'parent_profiles', 'allergies', 'medical_notes',
            'authorized_pickup_notes', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['unique_code']
