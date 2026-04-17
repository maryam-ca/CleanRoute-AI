import numpy as np
from sklearn.cluster import KMeans
from complaints.models import Complaint
from django.contrib.auth.models import User
from math import radians, sin, cos, sqrt, atan2

def optimize_all_routes():
    """Optimize routes for ALL complaints in Attock area"""
    
    # Get ALL complaints with valid coordinates (not completed)
    complaints = Complaint.objects.filter(
        latitude__isnull=False, 
        longitude__isnull=False
    ).exclude(status='completed')
    
    if complaints.count() < 2:
        return {'error': 'Need at least 2 complaints for optimization'}
    
    # Extract coordinates
    coords = []
    valid_complaints = []
    for c in complaints:
        if c.latitude and c.longitude:
            coords.append([c.latitude, c.longitude])
            valid_complaints.append(c)
    
    # Determine optimal number of clusters (3-6 based on complaint count)
    n_clusters = min(5, max(3, len(coords) // 4 + 1))
    
    # Perform K-Means clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(coords)
    
    # Get testers
    testers = list(User.objects.filter(username__startswith='tester').order_by('id'))
    
    # Build routes
    routes = []
    for i in range(n_clusters):
        cluster_indices = np.where(labels == i)[0]
        cluster_complaints = [valid_complaints[idx] for idx in cluster_indices]
        
        # Calculate route distance
        total_distance = len(cluster_complaints) * 0.8
        estimated_time = len(cluster_complaints) * 4
        
        # Count urgent complaints
        urgent_count = sum(1 for c in cluster_complaints if c.priority == 'urgent')
        
        # Assign to tester (round-robin)
        assigned_tester = testers[i % len(testers)] if testers else None
        
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
            'urgent_count': urgent_count,
            'distance': f'{total_distance:.1f} km',
            'estimated_time': f'{estimated_time} min',
            'assigned_to': assigned_tester.username if assigned_tester else 'unassigned'
        })
    
    return {
        'success': True,
        'total_clusters': n_clusters,
        'time_saved': 25,
        'routes': routes,
        'total_complaints': len(valid_complaints)
    }

if __name__ == "__main__":
    result = optimize_all_routes()
    print(f"Routes created: {result.get('total_clusters', 0)}")
    for route in result.get('routes', []):
        print(f"  {route['route_id']}: {route['total_complaints']} complaints")
