from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from django.contrib.auth.models import User
from .models import Complaint, Notification
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, NotificationSerializer
import math

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in meters using Haversine formula"""
    R = 6371000  # Earth's radius in meters
    lat1_rad = math.radians(float(lat1))
    lat2_rad = math.radians(float(lat2))
    delta_lat = math.radians(float(lat2) - float(lat1))
    delta_lon = math.radians(float(lon2) - float(lon1))
    
    a = math.sin(delta_lat/2) * math.sin(delta_lat/2) + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * \
        math.sin(delta_lon/2) * math.sin(delta_lon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        try:
            role = user.profile.role
        except:
            role = 'citizen'
        
        if role in ['admin', 'authority']:
            return Complaint.objects.all().order_by('-created_at')
        else:
            return Complaint.objects.filter(user=user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        return ComplaintSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        latitude = float(self.request.data.get('latitude', 0))
        longitude = float(self.request.data.get('longitude', 0))
        
        # Check for duplicate complaints within 15 meters (for same user)
        if user and latitude and longitude:
            recent_complaints = Complaint.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timezone.timedelta(hours=24)
            )
            
            for existing in recent_complaints:
                if existing.latitude and existing.longitude:
                    distance = calculate_distance(
                        latitude, longitude,
                        float(existing.latitude), float(existing.longitude)
                    )
                    if distance < 15:  # Within 15 meters
                        return Response({
                            'error': f'Duplicate complaint detected! A complaint already exists within {distance:.0f} meters of this location.',
                            'existing_complaint_id': existing.id,
                            'distance_meters': round(distance, 1)
                        }, status=status.HTTP_409_CONFLICT)
        
        # Create the complaint
        complaint = serializer.save(user=user)
        
        # Create notifications for admin users
        admin_users = User.objects.filter(profile__role='admin')
        for admin_user in admin_users:
            Notification.objects.create(
                user=admin_user,
                complaint=complaint,
                notification_type='new_complaint',
                title=f'New Complaint #{complaint.complaint_number}',
                message=f'{complaint.complaint_type} from {user.username} at {complaint.latitude}, {complaint.longitude}'
            )




