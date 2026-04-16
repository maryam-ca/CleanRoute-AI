"""
Advanced Anomaly Detection Module
- Real-time anomaly scoring
- Hotspot detection
- Alert generation
- Pattern recognition
"""

import numpy as np
import pickle
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import os
from math import radians, sin, cos, sqrt, atan2
import json
from collections import defaultdict

class AdvancedAnomalyDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.contamination = 0.1
        self.alert_history = []
        
    def extract_features(self, complaints):
        """Extract advanced features for anomaly detection"""
        features = []
        
        for complaint in complaints:
            # Time-based features
            hour = complaint.created_at.hour
            day_of_week = complaint.created_at.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            is_night = 1 if hour < 6 or hour > 20 else 0
            is_peak_hour = 1 if 7 <= hour <= 9 or 17 <= hour <= 19 else 0
            
            # Location features
            lat = complaint.latitude
            lng = complaint.longitude
            
            # Complaint features
            priority_score = {'low': 1, 'medium': 2, 'high': 3, 'urgent': 4}.get(complaint.priority, 2)
            type_score = {
                'overflowing': 3, 'illegal': 5, 'missed': 2, 
                'spillage': 2, 'other': 1
            }.get(complaint.complaint_type, 2)
            
            # Fill level
            fill_level = complaint.fill_level_before or 50
            
            # Derived features
            urgency_score = priority_score * (fill_level / 100)
            severity_score = type_score * (fill_level / 100)
            
            features.append([
                hour, day_of_week, is_weekend, is_night, is_peak_hour,
                lat, lng,
                priority_score, type_score, fill_level,
                urgency_score, severity_score
            ])
        
        return np.array(features)
    
    def train(self, complaints):
        """Train the Isolation Forest model"""
        if len(complaints) < 10:
            print(f"⚠️ Need at least 10 complaints to train (have {len(complaints)})")
            return False
        
        X = self.extract_features(complaints)
        X_scaled = self.scaler.fit_transform(X)
        
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=150,
            max_samples='auto',
            bootstrap=True
        )
        self.model.fit(X_scaled)
        
        # Save model
        os.makedirs('models', exist_ok=True)
        with open('models/anomaly_detector_advanced.pkl', 'wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler,
                'features': ['hour', 'day_of_week', 'is_weekend', 'is_night', 'is_peak_hour',
                            'latitude', 'longitude', 'priority_score', 'type_score', 
                            'fill_level', 'urgency_score', 'severity_score']
            }, f)
        
        print(f"✅ Advanced Anomaly Detection Model trained on {len(complaints)} complaints")
        return True
    
    def detect_anomalies(self, complaints, threshold=0.7):
        """Detect anomalies with severity scores"""
        if self.model is None:
            try:
                with open('models/anomaly_detector_advanced.pkl', 'rb') as f:
                    saved = pickle.load(f)
                    self.model = saved['model']
                    self.scaler = saved['scaler']
            except:
                return []
        
        if len(complaints) == 0:
            return []
        
        X = self.extract_features(complaints)
        X_scaled = self.scaler.transform(X)
        
        predictions = self.model.predict(X_scaled)
        scores = self.model.score_samples(X_scaled)
        
        # Normalize scores to 0-1 range
        min_score = np.min(scores)
        max_score = np.max(scores)
        normalized_scores = (scores - min_score) / (max_score - min_score) if max_score > min_score else scores
        
        anomalies = []
        alerts = []
        
        for i, (complaint, pred, score, norm_score) in enumerate(zip(complaints, predictions, scores, normalized_scores)):
            if pred == -1 or norm_score > threshold:
                severity = 'high' if norm_score > 0.85 else 'medium' if norm_score > 0.7 else 'low'
                
                anomaly = {
                    'complaint_id': complaint.id,
                    'latitude': complaint.latitude,
                    'longitude': complaint.longitude,
                    'priority': complaint.priority,
                    'complaint_type': complaint.complaint_type,
                    'anomaly_score': float(norm_score),
                    'severity': severity,
                    'fill_level': complaint.fill_level_before,
                    'description': complaint.description[:100] if complaint.description else '',
                    'timestamp': complaint.created_at.isoformat() if complaint.created_at else None
                }
                anomalies.append(anomaly)
                
                # Generate alert for high severity
                if severity == 'high':
                    alerts.append({
                        'type': 'anomaly_detected',
                        'severity': severity,
                        'message': f"⚠️ HIGH SEVERITY ANOMALY: Illegal dumping suspected at location",
                        'complaint_id': complaint.id,
                        'timestamp': datetime.now().isoformat()
                    })
        
        # Save alerts
        self.alert_history.extend(alerts)
        self._save_alerts()
        
        return anomalies, alerts
    
    def get_hotspots(self, complaints, radius_km=0.3, min_cluster_size=2):
        """Identify anomaly hotspots (clusters) with intensity scoring"""
        anomalies, _ = self.detect_anomalies(complaints)
        
        if len(anomalies) < min_cluster_size:
            return []
        
        # Simple distance-based clustering
        hotspots = []
        used = set()
        
        for i, a1 in enumerate(anomalies):
            if i in used:
                continue
            
            cluster = [a1]
            used.add(i)
            
            for j, a2 in enumerate(anomalies):
                if j in used:
                    continue
                
                # Calculate distance using Haversine formula
                lat1, lon1 = a1['latitude'], a1['longitude']
                lat2, lon2 = a2['latitude'], a2['longitude']
                
                R = 6371  # Earth's radius in km
                dlat = radians(lat2 - lat1)
                dlon = radians(lon2 - lon1)
                a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                distance = R * 2 * atan2(sqrt(a), sqrt(1-a))
                
                if distance < radius_km:
                    cluster.append(a2)
                    used.add(j)
            
            if len(cluster) >= min_cluster_size:
                # Calculate cluster intensity (average anomaly score)
                intensity = sum(c['anomaly_score'] for c in cluster) / len(cluster)
                
                center_lat = sum(c['latitude'] for c in cluster) / len(cluster)
                center_lon = sum(c['longitude'] for c in cluster) / len(cluster)
                
                hotspots.append({
                    'center_lat': center_lat,
                    'center_lon': center_lon,
                    'intensity': round(intensity, 3),
                    'size': len(cluster),
                    'radius_km': radius_km,
                    'severity': 'high' if intensity > 0.85 else 'medium' if intensity > 0.7 else 'low',
                    'complaints': cluster
                })
        
        return sorted(hotspots, key=lambda x: x['intensity'], reverse=True)
    
    def get_recent_alerts(self, minutes=60):
        """Get recent alerts"""
        cutoff = datetime.now() - timedelta(minutes=minutes)
        return [alert for alert in self.alert_history 
                if datetime.fromisoformat(alert['timestamp']) > cutoff]
    
    def _save_alerts(self):
        """Save alerts to file"""
        try:
            with open('models/anomaly_alerts.json', 'w') as f:
                json.dump(self.alert_history[-100:], f)  # Keep last 100 alerts
        except:
            pass
    
    def get_statistics(self, complaints):
        """Get anomaly detection statistics"""
        anomalies, alerts = self.detect_anomalies(complaints)
        hotspots = self.get_hotspots(complaints)
        
        return {
            'total_complaints': len(complaints),
            'total_anomalies': len(anomalies),
            'anomaly_rate': round(len(anomalies) / len(complaints) * 100, 2) if complaints else 0,
            'total_hotspots': len(hotspots),
            'high_severity_alerts': len([a for a in alerts if a['severity'] == 'high']),
            'recent_alerts': self.get_recent_alerts(60),
            'hotspots': hotspots,
            'anomalies': anomalies
        }

# Global instance
anomaly_detector = AdvancedAnomalyDetector()

def get_anomaly_statistics(complaints):
    """Wrapper function"""
    return anomaly_detector.get_statistics(complaints)

if __name__ == "__main__":
    print("✅ Advanced Anomaly Detection Module Ready")
