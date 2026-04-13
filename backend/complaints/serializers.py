from rest_framework import serializers
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'assigned_at', 'completed_at', 'closed_at']
    
    def get_user_name(self, obj):
        return obj.user.username if obj.user else 'Anonymous'
    
    def get_assigned_to_name(self, obj):
        return obj.assigned_to.username if obj.assigned_to else 'Unassigned'
