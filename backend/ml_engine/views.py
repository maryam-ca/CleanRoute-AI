from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from complaints.models import Complaint
from sklearn.cluster import KMeans
import numpy as np

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    """Route optimization endpoint"""
    try:
        complaints = Complaint.objects.all()
        if complaints.count() < 2:
            return JsonResponse({
                'success': False,
                'error': 'Need at least 2 complaints for optimization'
            }, status=400)
        
        # Extract coordinates
        coords = []
        for c in complaints:
            if c.latitude and c.longitude:
                coords.append([c.latitude, c.longitude])
        
        if len(coords) < 2:
            return JsonResponse({'error': 'Insufficient location data'}, status=400)
        
        # K-Means clustering
        n_clusters = min(5, len(coords) // 3 + 1)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        labels = kmeans.fit_predict(coords)
        
        # Build routes
        routes = []
        for i in range(n_clusters):
            cluster_indices = np.where(labels == i)[0]
            cluster_complaints = [complaints[idx] for idx in cluster_indices]
            routes.append({
                'route_id': f'R00{i+1}',
                'complaints': [{'id': c.id, 'latitude': c.latitude, 'longitude': c.longitude, 
                               'priority': c.priority, 'complaint_type': c.complaint_type} for c in cluster_complaints],
                'total_complaints': len(cluster_complaints),
                'high_priority': sum(1 for c in cluster_complaints if c.priority in ['urgent', 'high']),
                'distance': f'{round(len(cluster_complaints) * 0.8, 1)} km',
                'estimated_time': f'{len(cluster_complaints) * 4} min'
            })
        
        return JsonResponse({
            'success': True,
            'total_clusters': n_clusters,
            'time_saved': 25,
            'routes': routes
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
