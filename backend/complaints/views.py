from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Complaint
from .serializers import ComplaintSerializer
import random
from .routing import auto_assign_complaint, choose_best_tester_for_point, optimize_area_for_complaint

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = self._get_user_role(user)
        
        if role == 'admin':
            return Complaint.objects.all().order_by('-created_at')
        elif role == 'tester':
            return Complaint.objects.filter(assigned_to=user).order_by('-created_at')
        else:
            return Complaint.objects.filter(user=user).order_by('-created_at')

    def _get_user_role(self, user):
        username = user.username.lower()
        if username == 'admin':
            return 'admin'
        elif username.startswith('tester'):
            return 'tester'
        else:
            return 'citizen'

    def create(self, request):
        user = request.user
        role = self._get_user_role(user)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if role == 'citizen':
            complaint = serializer.save(user=user)
        else:
            complaint = serializer.save()

        auto_assign_complaint(complaint)
        optimize_area_for_complaint(complaint)
        response_serializer = self.get_serializer(complaint)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        complaint = self.get_object()
        tester_username = request.data.get('tester_username')
        
        if not tester_username:
            return Response({'error': 'Tester username required'}, status=400)
        
        try:
            tester = User.objects.get(username=tester_username)
            complaint.assigned_to = tester
            complaint.status = 'assigned'
            complaint.assigned_at = timezone.now()
            complaint.save()
            
            serializer = self.get_serializer(complaint)
            
            return Response({
                'success': True,
                'complaint': serializer.data,
                'assigned_to': tester.username,
                'message': f'Complaint #{complaint.id} assigned to {tester.username}'
            })
        except User.DoesNotExist:
            return Response({'error': 'Tester not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['post'])
    def auto_assign(self, request):
        """Assign complaint to the tester whose active route is nearest."""
        try:
            complaint_id = request.data.get('complaint_id')
            
            if not complaint_id:
                return Response({'error': 'Complaint ID required'}, status=400)
            
            try:
                complaint = Complaint.objects.get(id=complaint_id)
            except Complaint.DoesNotExist:
                return Response({'error': 'Complaint not found'}, status=404)
            
            if not complaint.latitude or not complaint.longitude:
                return Response({'error': 'Complaint coordinates required for auto-assign'}, status=400)

            best_match = choose_best_tester_for_point(float(complaint.latitude), float(complaint.longitude))
            if not best_match:
                return Response({'error': 'No testers available'}, status=400)

            complaint.assigned_to = best_match['tester']
            complaint.status = 'assigned'
            complaint.assigned_at = timezone.now()
            complaint.save(update_fields=['assigned_to', 'status', 'assigned_at'])
            
            return Response({
                'success': True,
                'complaint_id': complaint.id,
                'assigned_to': best_match['tester'].username,
                'score': best_match['score'],
                'distance_km': best_match['distance_km'],
                'assigned_count': best_match['active_count'],
                'message': f'Route-optimized assignment to {best_match["tester"].username}'
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        user = request.user
        complaints = Complaint.objects.filter(assigned_to=user, status='assigned')
        serializer = self.get_serializer(complaints, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        role = self._get_user_role(user)
        
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

    @action(detail=True, methods=['post'])
    def complete_task(self, request, pk=None):
        complaint = self.get_object()
        after_image = request.FILES.get('after_image')
        
        if complaint.assigned_to_id != request.user.id:
            return Response({'error': 'You can only complete tasks assigned to you'}, status=403)
        
        if complaint.status != 'assigned':
            return Response({'error': 'Only assigned complaints can be completed'}, status=400)
        
        if not after_image:
            return Response({'error': 'After cleaning image required'}, status=400)
        
        try:
            complaint.after_image = after_image
            complaint.status = 'completed'
            complaint.completed_at = timezone.now()
            
            before = complaint.fill_level_before or 0
            after = max(0, before - random.randint(15, 40))
            complaint.fill_level_after = after
            complaint.save()
            
            reduction = before - after
            
            return Response({
                'success': True,
                'fill_level_before': before,
                'fill_level_after': after,
                'reduction': reduction,
                'status': complaint.status
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)


