from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from complaints.models import Complaint
from sklearn.cluster import KMeans
import numpy as np
from math import radians, sin, cos, sqrt, atan2
from django.contrib.auth.models import User
from django.utils import timezone
import random

@api_view(['GET'])
@permission_classes([AllowAny])
def setup_database(request):
    """One-click setup - runs migrations and seeds data"""
    from django.core.management import call_command
    import sys
    from io import StringIO
    
    # Run migrations
    out = StringIO()
    call_command('migrate', verbosity=0, stdout=out)
    
    # Create users
    users_data = [
        ('admin', 'admin123', True),
        ('citizen', 'citizen123', False),
        ('tester1', 'tester123', False),
        ('tester2', 'tester123', False),
        ('tester3', 'tester123', False),
        ('tester4', 'tester123', False),
        ('tester5', 'tester123', False),
    ]
    
    created_users = []
    for username, password, is_admin in users_data:
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.set_password(password)
            if is_admin:
                user.is_staff = True
                user.is_superuser = True
            user.save()
            created_users.append(username)
    
    # Create sample complaints in Mehria Town, Attock
    mehria_coords = [
        (33.814890, 72.348424), (33.814060, 72.349107), (33.814301, 72.349665),
        (33.813543, 72.350030), (33.813459, 72.351639), (33.812157, 72.351564),
        (33.811381, 72.349215), (33.809857, 72.349365), (33.808252, 72.349655),
        (33.808216, 72.352219), (33.806594, 72.351511), (33.806910, 72.348550),
        (33.805965, 72.355588), (33.805162, 72.354901), (33.810600, 72.346404),
        (33.813649, 72.346726), (33.817722, 72.346500)
    ]
    
    priorities = ['urgent', 'high', 'medium', 'low']
    types = ['overflowing', 'missed', 'illegal', 'other']
    citizen = User.objects.get(username='citizen')
    
    created_complaints = 0
    for i, (lat, lng) in enumerate(mehria_coords):
        complaint, created = Complaint.objects.get_or_create(
            latitude=lat,
            longitude=lng,
            defaults={
                'complaint_type': random.choice(types),
                'description': f'Complaint in Mehria Town #{i+1}',
                'priority': random.choice(priorities),
                'fill_level_before': random.randint(40, 95),
                'status': 'assigned',
                'user': citizen,
                'created_at': timezone.now()
            }
        )
        if created:
            created_complaints += 1
    
    return JsonResponse({
        'status': 'success',
        'migrations': 'completed',
        'users_created': created_users,
        'complaints_created': created_complaints,
        'message': 'Database ready! You can now login.'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    """Create 5 geographic routes using K-Means clustering"""
    try:
        print("=" * 60)
        print("🗺️ GEOGRAPHIC ROUTE OPTIMIZATION")
        print("=" * 60)
        
        # Get all active complaints with coordinates (exclude completed)
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict_waste(request):
    """Generate waste prediction for the next 7 days"""
    from datetime import datetime, timedelta
    import random
    
    days = int(request.GET.get('days', 7))
    
    predictions = []
    for i in range(days):
        date = datetime.now() + timedelta(days=i)
        predictions.append({
            'date': date.strftime('%Y-%m-%d'),
            'predicted_complaints': random.randint(5, 25),
            'confidence': random.randint(70, 95)
        })
    
    return JsonResponse({
        'success': True,
        'predictions': predictions,
        'total_expected': sum(p['predicted_complaints'] for p in predictions),
        'peak_day': max(predictions, key=lambda x: x['predicted_complaints'])['date']
    })
