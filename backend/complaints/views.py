from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q
from .models import Complaint
from .serializers import ComplaintSerializer
from ml_engine.waste_detection import waste_detector

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Complaint.objects.all().order_by('-created_at')
        
        try:
            if hasattr(user, 'profile') and user.profile.role in ['admin', 'authority']:
                return Complaint.objects.all().order_by('-created_at')
        except:
            pass
        
        return Complaint.objects.filter(user=user).order_by('-created_at')
    
    def create(self, request):
        print("=== CREATE COMPLAINT ===")
        
        if request.user.is_authenticated:
            user = request.user
        else:
            user, _ = User.objects.get_or_create(username='default_user')
        
        data = {
            'complaint_type': request.data.get('complaint_type', 'overflowing'),
            'priority': request.data.get('priority', 'medium'),
            'latitude': request.data.get('latitude'),
            'longitude': request.data.get('longitude'),
            'description': request.data.get('description', ''),
            'user': user.id
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
    def mark_completed(self, request, pk=None):
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
            'status': complaint.status
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        complaint = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in ['pending', 'assigned', 'in_progress', 'completed']:
            complaint.status = new_status
            if new_status == 'assigned':
                complaint.assigned_at = timezone.now()
            elif new_status == 'completed':
                complaint.completed_at = timezone.now()
            complaint.save()
            return Response({'success': True, 'status': complaint.status})
        
        return Response({'error': 'Invalid status'}, status=400)
    
    @action(detail=False, methods=['get'])
    def testers(self, request):
        testers = User.objects.filter(profile__role='tester')
        return Response([{'id': t.id, 'username': t.username} for t in testers])
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        if request.user.is_authenticated:
            try:
                if hasattr(request.user, 'profile') and request.user.profile.role in ['admin', 'authority']:
                    complaints = Complaint.objects.all()
                else:
                    complaints = Complaint.objects.filter(user=request.user)
            except:
                complaints = Complaint.objects.filter(user=request.user)
        else:
            complaints = Complaint.objects.all()
        
        total = complaints.count()
        pending = complaints.filter(status='pending').count()
        assigned = complaints.filter(status='assigned').count()
        completed = complaints.filter(status='completed').count()
        
        return Response({
            'total_complaints': total,
            'pending_complaints': pending,
            'assigned_complaints': assigned,
            'completed_complaints': completed,
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 2)
        })
