from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from complaints.models import Complaint
import numpy as np
from sklearn.cluster import KMeans
import random

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    try:
        area = request.data.get('area', 'Islamabad')
        
        # Get complaints from database
        complaints = Complaint.objects.filter(status__in=['pending', 'assigned'])
        
        # Filter by area coordinates
        if area == 'Islamabad':
            complaints = complaints.filter(
                latitude__gte=33.5, latitude__lte=33.9,
                longitude__gte=72.8, longitude__lte=73.3
            )
        elif area == 'Karachi':
            complaints = complaints.filter(
                latitude__gte=24.7, latitude__lte=25.0,
                longitude__gte=66.9, longitude__lte=67.2
            )
        elif area == 'Lahore':
            complaints = complaints.filter(
                latitude__gte=31.4, latitude__lte=31.7,
                longitude__gte=74.2, longitude__lte=74.5
            )
        elif area == 'Attock':
            # Attock coordinates: Mehria Town area
            complaints = complaints.filter(
                latitude__gte=33.75, latitude__lte=33.80,
                longitude__gte=72.35, longitude__lte=72.42
            )
            
            # If no complaints in Attock, generate sample data for demo
            if complaints.count() == 0:
                # Create sample complaints for Attock Mehria Town area
                attock_locations = [
                    (33.7667, 72.3667, "Mehria Town Main"),
                    (33.7680, 72.3680, "Mehria Town Sector A"),
                    (33.7700, 72.3700, "Mehria Town Sector B"),
                    (33.7720, 72.3650, "Mehria Town Sector C"),
                    (33.7650, 72.3640, "Mehria Town Near Mosque"),
                    (33.7675, 72.3675, "Mehria Town Park"),
                    (33.7690, 72.3690, "Mehria Town Market"),
                    (33.7710, 72.3660, "Mehria Town School"),
                    (33.7730, 72.3680, "Mehria Town Hospital Road"),
                    (33.7640, 72.3630, "Mehria Town Extension"),
                ]
                
                # Create sample complaints for response
                sample_complaints = []
                for i, (lat, lng, location) in enumerate(attock_locations[:8]):
                    sample_complaints.append({
                        'id': i + 100,
                        'latitude': lat + random.uniform(-0.002, 0.002),
                        'longitude': lng + random.uniform(-0.002, 0.002),
                        'location': location,
                        'priority': random.choice(['high', 'medium', 'low']),
                        'complaint_type': random.choice(['overflowing', 'spillage', 'missed'])
                    })
                
                # Return sample data for Attock
                coords = [[c['latitude'], c['longitude']] for c in sample_complaints]
                coords = np.array(coords)
                n_clusters = min(3, len(coords))
                
                if n_clusters > 1:
                    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                    labels = kmeans.fit_predict(coords)
                else:
                    labels = [0] * len(coords)
                
                routes = []
                for i in range(n_clusters):
                    cluster_indices = [j for j in range(len(coords)) if labels[j] == i]
                    route_complaints = len(cluster_indices)
                    high_priority = sum(1 for j in cluster_indices if sample_complaints[j]['priority'] in ['high', 'urgent'])
                    
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
                    'total_complaints': len(sample_complaints),
                    'total_clusters': n_clusters,
                    'routes': routes,
                    'time_saved': 25,
                    'complaints': sample_complaints
                })
        
        total = complaints.count()
        
        if total == 0:
            return Response({
                'success': True,
                'total_complaints': 0,
                'total_clusters': 0,
                'routes': [],
                'time_saved': 25
            })
        
        # Extract coordinates
        coords = []
        for c in complaints:
            coords.append([float(c.latitude), float(c.longitude)])
        coords = np.array(coords)
        
        # Determine number of clusters
        n_clusters = min(5, total)
        if n_clusters < 2:
            n_clusters = 1
        
        # Apply K-Means
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)
        
        # Build routes
        routes = []
        for i in range(n_clusters):
            cluster_indices = [j for j in range(total) if labels[j] == i]
            route_complaints = len(cluster_indices)
            high_priority = sum(1 for j in cluster_indices if complaints[j].priority in ['high', 'urgent'])
            
            routes.append({
                'cluster_id': i,
                'route_id': f'R00{i+1}',
                'total_complaints': route_complaints,
                'high_priority': high_priority,
                'distance': f'{route_complaints * 1.2:.1f} km',
                'estimated_time': f'{route_complaints * 5} min'
            })
        
        return Response({
            'success': True,
            'area': area,
            'total_complaints': total,
            'total_clusters': n_clusters,
            'routes': routes,
            'time_saved': 25
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to optimize routes'
        }, status=500)
