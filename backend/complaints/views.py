from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q
from .models import Complaint
from .serializers import ComplaintSerializer
from ml_engine.waste_detection import waste_detector

class ComplaintViewSet(viewsets.ModelViewSet):
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
        elif role == 'authority':
            return Complaint.objects.all().order_by('-created_at')
        elif role == 'tester':
            return Complaint.objects.filter(assigned_to=user).order_by('-created_at')
        else:
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
            ai_result = waste_detector.analyze_waste_level(image_file)
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
                'fill_level': complaint.fill_level_before,
                'created_at': complaint.created_at.isoformat()
            }, status=status.HTTP_201_CREATED)
        
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def assign_to_tester(self, request, pk=None):
        complaint = self.get_object()
        tester_username = request.data.get('tester_username')
        
        print(f"=== ASSIGNING Complaint #{complaint.id} to tester: {tester_username} ===")
        
        try:
            tester = User.objects.get(username=tester_username)
            complaint.assigned_to = tester
            complaint.status = 'assigned'
            complaint.assigned_at = timezone.now()
            complaint.save()
            
            print(f"✅ Assigned to {tester.username} (ID: {tester.id})")
            
            return Response({
                'success': True,
                'assigned_to': tester.username,
                'assigned_to_id': tester.id,
                'status': complaint.status,
                'assigned_at': complaint.assigned_at.isoformat()
            })
        except User.DoesNotExist:
            print(f"❌ Tester not found: {tester_username}")
            return Response({'error': 'Tester not found'}, status=404)
    
    @action(detail=True, methods=['post'])
    def complete_by_tester(self, request, pk=None):
        complaint = self.get_object()
        after_image = request.FILES.get('after_image')
        
        if not after_image:
            return Response({'error': 'After cleaning image required'}, status=400)
        
        ai_result = waste_detector.analyze_waste_level(after_image)
        
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
            'status': complaint.status,
            'completed_at': complaint.completed_at.isoformat()
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        complaint = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in ['pending', 'assigned', 'in_progress', 'completed', 'closed']:
            complaint.status = new_status
            if new_status == 'assigned':
                complaint.assigned_at = timezone.now()
            elif new_status == 'completed':
                complaint.completed_at = timezone.now()
            elif new_status == 'closed':
                complaint.closed_at = timezone.now()
            complaint.save()
            return Response({'success': True, 'status': complaint.status})
        
        return Response({'error': 'Invalid status'}, status=400)
    
    @action(detail=False, methods=['get'])
    def testers(self, request):
        from users.models import UserProfile
        testers = User.objects.filter(profile__role='tester')
        return Response([{'id': t.id, 'username': t.username} for t in testers])
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        
        if not user.is_authenticated:
            return Response({'total_complaints': 0})
        
        try:
            role = user.profile.role
        except:
            role = 'citizen'
        
        if role in ['admin', 'authority']:
            complaints = Complaint.objects.all()
        elif role == 'tester':
            complaints = Complaint.objects.filter(assigned_to=user)
        else:
            complaints = Complaint.objects.filter(user=user)
        
        total = complaints.count()
        pending = complaints.filter(status='pending').count()
        assigned = complaints.filter(status='assigned').count()
        completed = complaints.filter(status='completed').count()
        closed = complaints.filter(status='closed').count()
        
        return Response({
            'total_complaints': total,
            'pending_complaints': pending,
            'assigned_complaints': assigned,
            'completed_complaints': completed,
            'closed_complaints': closed,
            'resolution_rate': round(((completed + closed) / total * 100) if total > 0 else 0, 2)
        })
