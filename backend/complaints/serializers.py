from rest_framework import serializers
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = ['id', 'complaint_type', 'latitude', 'longitude', 'description', 
                  'image', 'after_image', 'priority', 'fill_level_before', 
                  'fill_level_after', 'status', 'user', 'assigned_to', 
                  'assigned_to_username', 'assigned_to_name', 'assigned_at', 
                  'created_at', 'completed_at']
    
    def get_assigned_to_username(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.username
        return None
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.username
        return None
