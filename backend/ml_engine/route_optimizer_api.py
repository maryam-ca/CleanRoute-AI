from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import numpy as np
from sklearn.cluster import KMeans
import random

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    """Optimize collection routes using K-Means clustering"""
    
    area = request.data.get('area', 'Islamabad')
    
    # Generate sample complaints based on area
    complaints = []
    
    if area == 'Islamabad':
        centers = [
            (33.6844, 73.0479, 'Sector F-7'),
            (33.6914, 73.0529, 'Sector F-8'),
            (33.6984, 73.0579, 'Sector G-7'),
            (33.7054, 73.0529, 'Sector G-8'),
            (33.7124, 73.0479, 'Sector H-8'),
        ]
    elif area == 'Karachi':
        centers = [
            (24.8607, 67.0011, 'Clifton'),
            (24.8707, 67.0111, 'Defence'),
            (24.8807, 67.0211, 'Gulshan'),
            (24.8907, 67.0311, 'North Nazimabad'),
            (24.8507, 67.0011, 'Saddar'),
        ]
    else:
        centers = [
            (31.5497, 74.3436, 'Gulberg'),
            (31.5597, 74.3536, 'Model Town'),
            (31.5697, 74.3636, 'Johar Town'),
            (31.5797, 74.3736, 'DHA'),
            (31.5397, 74.3336, 'Anarkali'),
        ]
    
    complaint_id = 1
    for lat, lng, location in centers:
        for i in range(random.randint(5, 15)):
            lat_offset = random.uniform(-0.02, 0.02)
            lng_offset = random.uniform(-0.02, 0.02)
            complaints.append({
                'id': complaint_id,
                'latitude': lat + lat_offset,
                'longitude': lng + lng_offset,
                'location': location,
                'priority': random.choice(['high', 'medium', 'low']),
                'complaint_type': random.choice(['overflowing', 'spillage', 'missed', 'illegal', 'other'])
            })
            complaint_id += 1
    
    # Perform K-Means clustering
    if len(complaints) >= 5:
        coords = np.array([[c['latitude'], c['longitude']] for c in complaints])
        kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        kmeans.fit(coords)
        labels = kmeans.labels_
        
        clusters = {}
        for i, complaint in enumerate(complaints):
            cluster_id = int(labels[i])
            if cluster_id not in clusters:
                clusters[cluster_id] = []
            clusters[cluster_id].append(complaint)
        
        routes = []
        for cluster_id, cluster_complaints in clusters.items():
            routes.append({
                'cluster_id': cluster_id,
                'route_id': f'R{cluster_id + 1:03d}',
                'total_complaints': len(cluster_complaints),
                'high_priority': sum(1 for c in cluster_complaints if c['priority'] == 'high'),
                'estimated_time': f"{len(cluster_complaints) * 5} min",
                'distance': f"{len(cluster_complaints) * 1.2:.1f} km"
            })
        
        return Response({
            'success': True,
            'area': area,
            'total_complaints': len(complaints),
            'total_clusters': len(routes),
            'routes': routes,
            'complaints': complaints[:50]
        })
    else:
        return Response({
            'success': True,
            'area': area,
            'total_complaints': len(complaints),
            'total_clusters': 0,
            'routes': [],
            'complaints': complaints
        })

urlpatterns = [
    path('', optimize_routes, name='optimize_routes'),
]
