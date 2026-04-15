from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Complaint
from ml_engine.anomaly_detector import anomaly_detector

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_anomalies(request):
    """Get anomalies and hotspots from complaints"""
    try:
        complaints = Complaint.objects.all()
        
        if complaints.count() == 0:
            return Response({
                'success': True,
                'total_anomalies': 0,
                'total_hotspots': 0,
                'anomalies': [],
                'hotspots': []
            })
        
        # Train model if not already trained
        try:
            anomalies = anomaly_detector.detect_anomalies(complaints)
            hotspots = anomaly_detector.get_hotspots(complaints)
        except:
            anomaly_detector.train(complaints)
            anomalies = anomaly_detector.detect_anomalies(complaints)
            hotspots = anomaly_detector.get_hotspots(complaints)
        
        # Format response
        anomaly_list = []
        for a in anomalies:
            anomaly_list.append({
                'id': a['complaint_id'],
                'latitude': a['latitude'],
                'longitude': a['longitude'],
                'priority': a['priority'],
                'complaint_type': a['complaint_type'],
                'anomaly_score': a['anomaly_score'],
                'description': a.get('description', '')
            })
        
        hotspot_list = []
        for h in hotspots:
            hotspot_list.append({
                'center_lat': h['center_lat'],
                'center_lon': h['center_lon'],
                'intensity': h['intensity'],
                'radius_km': 0.3
            })
        
        return Response({
            'success': True,
            'total_anomalies': len(anomalies),
            'total_hotspots': len(hotspots),
            'anomalies': anomaly_list,
            'hotspots': hotspot_list
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
