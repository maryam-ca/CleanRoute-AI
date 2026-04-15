from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from complaints.models import Complaint
import numpy as np
from sklearn.cluster import KMeans

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    try:
        area = request.data.get('area', 'Attock')
        
        # Get ALL complaints - NO FILTER
        complaints = Complaint.objects.filter(status__in=['pending', 'assigned'])
        
        total = complaints.count()
        
        if total == 0:
            return Response({
                'success': True,
                'total_complaints': 0,
                'total_clusters': 0,
                'routes': [],
                'complaints': [],
                'time_saved': 25
            })
        
        # Extract complaint data
        complaint_data = []
        coords = []
        for c in complaints:
            complaint_data.append({
                'id': c.id,
                'latitude': float(c.latitude),
                'longitude': float(c.longitude),
                'priority': c.priority,
                'complaint_type': c.complaint_type,
                'status': c.status,
                'description': c.description[:100] if c.description else ''
            })
            coords.append([float(c.latitude), float(c.longitude)])
        
        coords = np.array(coords)
        
        # K-Means clustering
        n_clusters = min(5, total)
        if n_clusters < 2:
            n_clusters = 1
        
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)
        
        routes = []
        for i in range(n_clusters):
            cluster_indices = [j for j in range(total) if labels[j] == i]
            route_complaints = len(cluster_indices)
            high_priority = sum(1 for j in cluster_indices if complaint_data[j]['priority'] in ['high', 'urgent'])
            
            routes.append({
                'cluster_id': i,
                'route_id': f'R00{i+1}',
                'total_complaints': route_complaints,
                'high_priority': high_priority,
                'distance': f'{route_complaints * 0.8:.1f} km',
                'estimated_time': f'{route_complaints * 4} min'
            })
        
        return Response({
            'success': True,
            'area': area,
            'total_complaints': total,
            'total_clusters': n_clusters,
            'routes': routes,
            'complaints': complaint_data,
            'time_saved': 25
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to optimize routes'
        }, status=500)
