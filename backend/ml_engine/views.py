from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from complaints.models import Complaint
from django.contrib.auth.models import User
from django.utils import timezone
from sklearn.cluster import KMeans
import numpy as np
from math import radians, sin, cos, sqrt, atan2

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    """Route optimization - maps each route to a specific tester"""
    try:
        print("=" * 50)
        print("🗺️ ROUTE OPTIMIZATION TRIGGERED")
        print("=" * 50)
        
        area = request.data.get('area', 'Attock')
        
        # Get all active complaints (not completed)
        complaints = list(Complaint.objects.filter(
            latitude__isnull=False, 
            longitude__isnull=False
        ).exclude(status='completed'))
        
        print(f"Total complaints found: {len(complaints)}")
        
        if len(complaints) < 2:
            return JsonResponse({
                'success': False,
                'error': 'Need at least 2 complaints for optimization'
            }, status=400)
        
        # Extract coordinates
        coords = []
        valid_complaints = []
        for c in complaints:
            if c.latitude and c.longitude:
                coords.append([c.latitude, c.longitude])
                valid_complaints.append(c)
        
        # Get testers (5 testers)
        testers = list(User.objects.filter(username__startswith='tester').order_by('id'))
        print(f"Testers available: {[t.username for t in testers]}")
        
        # Number of clusters = number of testers (5)
        n_clusters = len(testers)
        
        # Perform K-Means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)
        
        # Map each cluster to a specific tester (1:1 mapping)
        # Route 1 → tester1, Route 2 → tester2, etc.
        cluster_to_tester = {}
        for i in range(n_clusters):
            cluster_to_tester[i] = testers[i]
        
        # Build routes with proper tester assignment
        routes = []
        for i in range(n_clusters):
            cluster_indices = np.where(labels == i)[0]
            cluster_complaints = [valid_complaints[idx] for idx in cluster_indices]
            
            # Assign to specific tester
            assigned_tester = cluster_to_tester[i]
            
            # Calculate route metrics
            total_distance = len(cluster_complaints) * 0.8
            estimated_time = len(cluster_complaints) * 4
            urgent_count = sum(1 for c in cluster_complaints if c.priority == 'urgent')
            
            routes.append({
                'route_id': f'R00{i+1}',
                'assigned_tester': assigned_tester.username,
                'complaints': [{
                    'id': c.id,
                    'latitude': c.latitude,
                    'longitude': c.longitude,
                    'priority': c.priority,
                    'complaint_type': c.complaint_type,
                    'fill_level_before': c.fill_level_before
                } for c in cluster_complaints],
                'total_complaints': len(cluster_complaints),
                'high_priority': urgent_count,
                'distance': f'{total_distance:.1f} km',
                'estimated_time': f'{estimated_time} min'
            })
            
            print(f"Route {i+1}: {len(cluster_complaints)} complaints → {assigned_tester.username}")
        
        # Now reassign all complaints to their respective testers based on route clusters
        for route in routes:
            tester = User.objects.get(username=route['assigned_tester'])
            for complaint_data in route['complaints']:
                complaint = Complaint.objects.get(id=complaint_data['id'])
                complaint.assigned_to = tester
                complaint.status = 'assigned'
                complaint.assigned_at = timezone.now()
                complaint.save()
        
        print("\n✅ All complaints reassigned based on route clusters!")
        
        return JsonResponse({
            'success': True,
            'total_clusters': n_clusters,
            'time_saved': 25,
            'routes': routes,
            'area': area,
            'total_complaints': len(valid_complaints)
        })
        
    except Exception as e:
        print(f"Route optimization error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)





@api_view(['GET'])
def migrate_db(request):
    from django.core.management import call_command
    call_command('migrate', verbosity=0)
    return JsonResponse({'status': 'migrations completed'})
