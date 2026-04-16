"""
Anomaly Detection Module using Isolation Forest
Detects unusual complaint patterns and illegal dumping hotspots
"""

import numpy as np
import pickle
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import os
from math import radians, sin, cos, sqrt, atan2
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent / 'models'
MODEL_PATH = MODEL_DIR / 'anomaly_detector.pkl'

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.contamination = 0.1
        
    def extract_features(self, complaints):
        """Extract features from complaints for anomaly detection"""
        features = []
        valid_complaints = []
        
        for complaint in complaints:
            if complaint.latitude is None or complaint.longitude is None:
                continue

            # Time-based features
            hour = complaint.created_at.hour
            day_of_week = complaint.created_at.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            is_night = 1 if hour < 6 or hour > 20 else 0
            
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
            
            features.append([
                hour, day_of_week, is_weekend, is_night,
                lat, lng,
                priority_score, type_score, fill_level
            ])
            valid_complaints.append(complaint)
        
        return np.array(features), valid_complaints
    
    def train(self, complaints):
        """Train the Isolation Forest model"""
        X, valid_complaints = self.extract_features(complaints)

        if len(valid_complaints) < 10:
            print(f"Need at least 10 complaints to train (have {len(valid_complaints)})")
            return False

        X_scaled = self.scaler.fit_transform(X)
        
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )
        self.model.fit(X_scaled)
        
        # Save model
        MODEL_DIR.mkdir(exist_ok=True)
        with MODEL_PATH.open('wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler
            }, f)
        
        print(f"Anomaly Detection Model trained on {len(valid_complaints)} complaints")
        return True
    
    def detect_anomalies(self, complaints):
        """Detect anomalies in complaints"""
        if self.model is None:
            try:
                with MODEL_PATH.open('rb') as f:
                    saved = pickle.load(f)
                    self.model = saved['model']
                    self.scaler = saved['scaler']
            except:
                if not self.train(complaints):
                    return []
        
        if len(complaints) == 0:
            return []
        
        X, valid_complaints = self.extract_features(complaints)
        if len(valid_complaints) == 0:
            return []
        X_scaled = self.scaler.transform(X)
        
        predictions = self.model.predict(X_scaled)
        scores = self.model.score_samples(X_scaled)
        
        anomalies = []
        for i, (complaint, pred, score) in enumerate(zip(valid_complaints, predictions, scores)):
            if pred == -1:  # Anomaly detected
                anomalies.append({
                    'complaint_id': complaint.id,
                    'latitude': complaint.latitude,
                    'longitude': complaint.longitude,
                    'priority': complaint.priority,
                    'complaint_type': complaint.complaint_type,
                    'anomaly_score': float(score),
                    'fill_level': complaint.fill_level_before,
                    'description': complaint.description[:50] if complaint.description else ''
                })
        
        return anomalies
    
    def get_hotspots(self, complaints, radius_km=0.3):
        """Identify anomaly hotspots (clusters)"""
        anomalies = self.detect_anomalies(complaints)
        
        if len(anomalies) < 2:
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
                
                R = 6371
                dlat = radians(lat2 - lat1)
                dlon = radians(lon2 - lon1)
                a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                distance = R * 2 * atan2(sqrt(a), sqrt(1-a))
                
                if distance < radius_km:
                    cluster.append(a2)
                    used.add(j)
            
            if len(cluster) >= 2:
                center_lat = sum(c['latitude'] for c in cluster) / len(cluster)
                center_lon = sum(c['longitude'] for c in cluster) / len(cluster)
                
                hotspots.append({
                    'center_lat': center_lat,
                    'center_lon': center_lon,
                    'intensity': len(cluster),
                    'complaints': cluster
                })
        
        return sorted(hotspots, key=lambda x: x['intensity'], reverse=True)

# Global instance
anomaly_detector = AnomalyDetector()

def get_anomalies_and_hotspots(complaints):
    """Wrapper function"""
    anomalies = anomaly_detector.detect_anomalies(complaints)
    hotspots = anomaly_detector.get_hotspots(complaints)
    
    return {
        'anomalies': anomalies,
        'hotspots': hotspots,
        'total_anomalies': len(anomalies),
        'total_hotspots': len(hotspots)
    }

if __name__ == "__main__":
    print("Anomaly Detection Module Ready")
