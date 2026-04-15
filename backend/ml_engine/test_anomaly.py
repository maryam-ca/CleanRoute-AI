"""
Test Anomaly Detection Module
"""

from anomaly_detector import anomaly_detector
from complaints.models import Complaint
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

print('='*60)
print('🔍 ANOMALY DETECTION TEST')
print('='*60)

complaints = Complaint.objects.all()
print(f'Total complaints: {complaints.count()}')

if complaints.count() > 0:
    # Train model
    print('\n📊 Training Anomaly Detection Model...')
    anomaly_detector.train(complaints)
    
    # Detect anomalies
    anomalies = anomaly_detector.detect_anomalies(complaints)
    hotspots = anomaly_detector.get_hotspots(complaints)
    
    print(f'\n📈 Results:')
    print(f'   Anomalies detected: {len(anomalies)}')
    print(f'   Hotspots identified: {len(hotspots)}')
    
    if anomalies:
        print('\n📋 Anomaly Details:')
        for a in anomalies[:5]:
            print(f'   Complaint #{a["complaint_id"]}: {a["complaint_type"]} at ({a["latitude"]:.4f}, {a["longitude"]:.4f})')
    
    if hotspots:
        print('\n🔥 Hotspot Locations:')
        for h in hotspots:
            print(f'   Center: ({h["center_lat"]:.4f}, {h["center_lon"]:.4f}) - Intensity: {h["intensity"]} anomalies')
else:
    print('⚠️ No complaints found in database')

print('\n✅ Anomaly Detection Test Complete')
print('='*60)
