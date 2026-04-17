@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    """Create 5 geographic routes using K-Means clustering"""
    from sklearn.cluster import KMeans
    import numpy as np
    from complaints.models import Complaint
    from django.contrib.auth.models import User
    from django.utils import timezone
    import json
    
    try:
        print("=" * 60)
        print("🗺️ GEOGRAPHIC ROUTE OPTIMIZATION")
        print("=" * 60)
        
        # Get all active complaints with coordinates
        complaints = list(Complaint.objects.filter(
            latitude__isnull=False, 
            longitude__isnull=False
        ).exclude(status='completed'))
        
        print(f"📊 Total complaints found: {len(complaints)}")
        
        if len(complaints) < 5:
            return JsonResponse({'error': 'Need at least 5 complaints for clustering'}, status=400)
        
        # Extract coordinates
        coords = []
        valid_complaints = []
        for c in complaints:
            if c.latitude and c.longitude:
                coords.append([c.latitude, c.longitude])
                valid_complaints.append(c)
        
        # Create 5 geographic clusters
        n_clusters = 5
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)
        
        # Get testers
        testers = list(User.objects.filter(username__startswith='tester').order_by('id'))
        
        # Map each cluster to a tester
        routes = []
        for i in range(n_clusters):
            cluster_indices = np.where(labels == i)[0]
            cluster_complaints = [valid_complaints[idx] for idx in cluster_indices]
            
            # Calculate cluster center
            center_lat = np.mean([c.latitude for c in cluster_complaints])
            center_lng = np.mean([c.longitude for c in cluster_complaints])
            
            # Assign to tester (1:1 mapping)
            assigned_tester = testers[i % len(testers)]
            
            routes.append({
                'route_id': f'R00{i+1}',
                'assigned_tester': assigned_tester.username,
                'center': {'lat': center_lat, 'lng': center_lng},
                'complaints': [{
                    'id': c.id,
                    'latitude': c.latitude,
                    'longitude': c.longitude,
                    'priority': c.priority,
                    'complaint_type': c.complaint_type,
                    'fill_level_before': c.fill_level_before
                } for c in cluster_complaints],
                'total_complaints': len(cluster_complaints),
                'urgent_count': sum(1 for c in cluster_complaints if c.priority == 'urgent')
            })
            
            print(f"📍 Route {i+1}: {len(cluster_complaints)} complaints → {assigned_tester.username}")
            print(f"   Center: ({center_lat:.4f}, {center_lng:.4f})")
        
        # Reassign all complaints based on clusters
        for route in routes:
            tester = User.objects.get(username=route['assigned_tester'])
            for complaint_data in route['complaints']:
                complaint = Complaint.objects.get(id=complaint_data['id'])
                complaint.assigned_to = tester
                complaint.status = 'assigned'
                complaint.assigned_at = timezone.now()
                complaint.save()
        
        print("\n✅ All complaints reassigned based on geographic clusters!")
        
        return JsonResponse({
            'success': True,
            'total_clusters': n_clusters,
            'total_complaints': len(valid_complaints),
            'routes': routes
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
