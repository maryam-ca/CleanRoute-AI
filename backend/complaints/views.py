from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Complaint
from .serializers import ComplaintSerializer
import random
from math import radians, sin, cos, sqrt, atan2

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
            serializer.save(user=user)
        else:
            serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
        """Enhanced AI assignment: Route Optimization (60%) + Workload Balance (40%)"""
        try:
            complaint_id = request.data.get('complaint_id')
            
            if not complaint_id:
                return Response({'error': 'Complaint ID required'}, status=400)
            
            try:
                complaint = Complaint.objects.get(id=complaint_id)
            except Complaint.DoesNotExist:
                return Response({'error': 'Complaint not found'}, status=404)
            
            testers = list(User.objects.filter(username__startswith='tester').order_by('id'))
            
            if not testers:
                return Response({'error': 'No testers available'}, status=400)
            
            tester_scores = []
            
            for tester in testers:
                assigned_count = Complaint.objects.filter(assigned_to=tester, status='assigned').count()
                workload_score = max(0, 40 - (assigned_count * 4))
                
                route_score = 0
                if complaint.latitude and complaint.longitude:
                    tester_complaints = Complaint.objects.filter(assigned_to=tester, status='assigned').exclude(latitude=None, longitude=None)
                    
                    if tester_complaints.count() > 0:
                        total_distance = 0
                        for tc in tester_complaints:
                            if tc.latitude and tc.longitude:
                                lat1, lon1 = radians(complaint.latitude), radians(complaint.longitude)
                                lat2, lon2 = radians(tc.latitude), radians(tc.longitude)
                                dlat = lat2 - lat1
                                dlon = lon2 - lon1
                                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                                distance = 6371 * 2 * atan2(sqrt(a), sqrt(1-a))
                                total_distance += distance
                        
                        avg_distance = total_distance / tester_complaints.count()
                        route_score = max(0, 60 - (avg_distance * 20))
                        route_score = min(60, route_score)
                    else:
                        route_score = 30
                else:
                    route_score = 30
                
                total_score = workload_score + route_score
                
                tester_scores.append({
                    'tester': tester,
                    'score': round(total_score, 2),
                    'assigned_count': assigned_count,
                    'workload_score': round(workload_score, 2),
                    'route_score': round(route_score, 2)
                })
            
            tester_scores.sort(key=lambda x: x['score'], reverse=True)
            best_match = tester_scores[0]
            
            complaint.assigned_to = best_match['tester']
            complaint.status = 'assigned'
            complaint.assigned_at = timezone.now()
            complaint.save()
            
            return Response({
                'success': True,
                'complaint_id': complaint.id,
                'assigned_to': best_match['tester'].username,
                'score': best_match['score'],
                'workload_score': best_match['workload_score'],
                'route_score': best_match['route_score'],
                'assigned_count': best_match['assigned_count'],
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
