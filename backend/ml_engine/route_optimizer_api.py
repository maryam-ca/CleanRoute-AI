from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from complaints.models import Complaint
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_routes(request):
    try:
        area = request.data.get('area', 'Islamabad')
        
        # Simple response with sample data
        if area == 'Islamabad':
            routes = [
                {'route_id': 'R001', 'total_complaints': 12, 'high_priority': 4, 'distance': '14.4 km', 'estimated_time': '60 min'},
                {'route_id': 'R002', 'total_complaints': 10, 'high_priority': 3, 'distance': '12.0 km', 'estimated_time': '50 min'},
                {'route_id': 'R003', 'total_complaints': 8, 'high_priority': 2, 'distance': '9.6 km', 'estimated_time': '40 min'},
                {'route_id': 'R004', 'total_complaints': 7, 'high_priority': 1, 'distance': '8.4 km', 'estimated_time': '35 min'},
                {'route_id': 'R005', 'total_complaints': 6, 'high_priority': 2, 'distance': '7.2 km', 'estimated_time': '30 min'},
            ]
        elif area == 'Attock':
            routes = [
                {'route_id': 'A001', 'total_complaints': 8, 'high_priority': 2, 'distance': '6.4 km', 'estimated_time': '40 min'},
                {'route_id': 'A002', 'total_complaints': 6, 'high_priority': 1, 'distance': '4.8 km', 'estimated_time': '30 min'},
                {'route_id': 'A003', 'total_complaints': 5, 'high_priority': 1, 'distance': '4.0 km', 'estimated_time': '25 min'},
            ]
        else:
            routes = [
                {'route_id': 'R001', 'total_complaints': 10, 'high_priority': 3, 'distance': '12.0 km', 'estimated_time': '50 min'},
                {'route_id': 'R002', 'total_complaints': 8, 'high_priority': 2, 'distance': '9.6 km', 'estimated_time': '40 min'},
            ]
        
        return Response({
            'success': True,
            'area': area,
            'total_complaints': sum(r['total_complaints'] for r in routes),
            'total_clusters': len(routes),
            'routes': routes,
            'time_saved': 25
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to optimize routes'
        }, status=500)
