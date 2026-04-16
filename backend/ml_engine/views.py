from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from complaints.models import Complaint
from sklearn.cluster import KMeans
import numpy as np

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    """Route optimization endpoint using K-Means clustering"""
    try:
        area = request.data.get('area', 'Attock')
        
        # Get all complaints
        complaints = Complaint.objects.all()
        
        if complaints.count() < 2:
            return JsonResponse({
                'success': False,
                'error': 'Need at least 2 complaints for optimization'
            }, status=400)
        
        # Extract coordinates from complaints
        coords = []
        valid_complaints = []
        for c in complaints:
            if c.latitude and c.longitude:
                coords.append([c.latitude, c.longitude])
                valid_complaints.append(c)
        
        if len(coords) < 2:
            return JsonResponse({
                'success': False,
                'error': 'Insufficient location data'
            }, status=400)
        
        # Determine optimal number of clusters (2-5)
        n_clusters = min(5, max(2, len(coords) // 3 + 1))
        
        # Perform K-Means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)
        
        # Build routes
        routes = []
        for i in range(n_clusters):
            cluster_indices = np.where(labels == i)[0]
            cluster_complaints = [valid_complaints[idx] for idx in cluster_indices]
            
            # Calculate cluster center
            center_lat = np.mean([c.latitude for c in cluster_complaints])
            center_lon = np.mean([c.longitude for c in cluster_complaints])
            
            # Calculate total distance (approximate)
            total_distance = len(cluster_complaints) * 0.8  # Rough estimate
            estimated_time = len(cluster_complaints) * 4  # 4 minutes per stop
            
            # Count urgent/high priority complaints
            high_priority = sum(1 for c in cluster_complaints if c.priority in ['urgent', 'high'])
            
            routes.append({
                'route_id': f'R{i+1:03d}',
                'complaints': [{
                    'id': c.id,
                    'latitude': c.latitude,
                    'longitude': c.longitude,
                    'priority': c.priority,
                    'complaint_type': c.complaint_type,
                    'fill_level_before': c.fill_level_before
                } for c in cluster_complaints],
                'total_complaints': len(cluster_complaints),
                'high_priority': high_priority,
                'distance': f'{total_distance:.1f} km',
                'estimated_time': f'{estimated_time} min',
                'center_lat': center_lat,
                'center_lon': center_lon
            })
        
        # Calculate time saved (approximate)
        time_saved = 25  # Default 25% time saved
        
        return JsonResponse({
            'success': True,
            'total_clusters': n_clusters,
            'time_saved': time_saved,
            'routes': routes,
            'area': area
        })
        
    except Exception as e:
        print(f"Route optimization error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
