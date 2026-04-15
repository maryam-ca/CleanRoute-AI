from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.utils import timezone
import random
from django.db.models import Q
from .models import Complaint, Notification
from .serializers import ComplaintSerializer
from ml_engine.waste_detection import waste_detector
from ml_engine.enhanced_waste_detector import analyze_waste_image

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return Complaint.objects.none()
        
        try:
            role = user.profile.role
        except:
            role = 'citizen'
        
        print(f"User: {user.username}, Role: {role}")
        
        if role == 'admin':
            return Complaint.objects.all().order_by('-created_at')
        elif role == 'tester':
            # Tester sees ONLY complaints assigned to them
            return Complaint.objects.filter(assigned_to=user).order_by('-created_at')
        else:
            # Citizen sees only their own complaints
            return Complaint.objects.filter(user=user).order_by('-created_at')
    
    def create(self, request):
        print("=== CREATE COMPLAINT ===")
        
        data = {
            'complaint_type': request.data.get('complaint_type', 'overflowing'),
            'priority': request.data.get('priority', 'medium'),
            'latitude': request.data.get('latitude'),
            'longitude': request.data.get('longitude'),
            'description': request.data.get('description', ''),
            'user': request.user.id
        }
        
        image_file = request.FILES.get('image')
        if image_file:
            ai_result = analyze_waste_image(image_file, data['complaint_type'])
            data['priority'] = ai_result['priority']
            data['fill_level_before'] = ai_result['fill_level']
            print(f"AI Result: Fill={ai_result['fill_level']}%, Priority={ai_result['priority']}")
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            complaint = serializer.save()
            return Response({
                'success': True,
                'id': complaint.id,
                'priority': complaint.priority,
                'fill_level': complaint.fill_level_before
            }, status=status.HTTP_201_CREATED)
        
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def assign_to_tester(self, request, pk=None):
        complaint = self.get_object()
        tester_username = request.data.get('tester_username')
        
        try:
            tester = User.objects.get(username=tester_username)
            complaint.assigned_to = tester
            complaint.status = 'assigned'
            complaint.assigned_at = timezone.now()
            complaint.save()
            
            return Response({
                'success': True,
                'assigned_to': tester.username,
                'status': complaint.status
            })
        except User.DoesNotExist:
            return Response({'error': 'Tester not found'}, status=404)
    
    @action(detail=True, methods=['post'])
    def complete_task(self, request, pk=None):
        complaint = self.get_object()
        after_image = request.FILES.get('after_image')
        
        if not after_image:
            return Response({'error': 'After cleaning image required'}, status=400)
        
        ai_result = analyze_waste_image(after_image, complaint.complaint_type, False)
        
        complaint.after_image = after_image
        complaint.fill_level_after = ai_result['fill_level']
        complaint.status = 'completed'
        complaint.completed_at = timezone.now()
        complaint.save()
        
        return Response({
            'success': True,
            'fill_level_before': complaint.fill_level_before,
            'fill_level_after': complaint.fill_level_after,
            'reduction': complaint.fill_level_before - complaint.fill_level_after,
            'status': complaint.status
        })
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        
        if not user.is_authenticated:
            return Response({'total_complaints': 0})
        
        try:
            role = user.profile.role
        except:
            role = 'citizen'
        
        if role == 'admin':
            complaints = Complaint.objects.all()
        elif role == 'tester':
            complaints = Complaint.objects.filter(assigned_to=user)
        else:
            complaints = Complaint.objects.filter(user=user)
        
        total = complaints.count()
        pending = complaints.filter(status='pending').count()
        assigned = complaints.filter(status='assigned').count()
        completed = complaints.filter(status='completed').count()
        
        return Response({
            'total_complaints': total,
            'pending_complaints': pending,
            'assigned_complaints': assigned,
            'completed_complaints': completed,
            'resolution_rate': round((completed / total * 100) if total > 0 else 0, 2)
        })
    
    @action(detail=False, methods=['get'])
    def testers(self, request):
        from users.models import UserProfile
        testers = User.objects.filter(profile__role='tester')
        return Response([{'id': t.id, 'username': t.username} for t in testers])





