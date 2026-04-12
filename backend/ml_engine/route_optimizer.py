import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os

class RouteOptimizer:
    def __init__(self, n_clusters=5):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
    
    def optimize_routes(self, complaint_locations):
        """
        complaint_locations: list of (latitude, longitude) tuples
        Returns: clustered routes and optimal sequence
        """
        if not complaint_locations:
            return {
                'clusters': [],
                'optimized_routes': {},
                'n_clusters': 0,
            }

        effective_clusters = self.n_clusters
        if len(complaint_locations) == 1:
            effective_clusters = 1
        elif len(complaint_locations) < effective_clusters:
            effective_clusters = max(2, len(complaint_locations) // 2)

        effective_clusters = min(effective_clusters, len(complaint_locations))
        kmeans = KMeans(n_clusters=effective_clusters, random_state=42)
        
        # Prepare coordinates
        coords = np.array(complaint_locations)
        
        # Scale features
        coords_scaled = self.scaler.fit_transform(coords)
        
        # Perform clustering
        clusters = kmeans.fit_predict(coords_scaled)
        
        # Optimize path for each cluster (Nearest Neighbor algorithm)
        optimized_routes = {}
        
        for cluster_id in range(effective_clusters):
            cluster_indices = np.where(clusters == cluster_id)[0]
            cluster_points = coords[cluster_indices]
            
            if len(cluster_points) > 1:
                # Nearest neighbor ordering
                ordered_indices = self._nearest_neighbor_order(cluster_points)
                optimized_routes[cluster_id] = {
                    'points': cluster_points[ordered_indices].tolist(),
                    'indices': cluster_indices[ordered_indices].tolist(),
                    'size': len(cluster_points)
                }
            else:
                optimized_routes[cluster_id] = {
                    'points': cluster_points.tolist(),
                    'indices': cluster_indices.tolist(),
                    'size': len(cluster_points)
                }
        
        return {
            'clusters': clusters.tolist(),
            'optimized_routes': optimized_routes,
            'n_clusters': effective_clusters
        }
    
    def _nearest_neighbor_order(self, points):
        """Order points using nearest neighbor algorithm"""
        n_points = len(points)
        visited = [False] * n_points
        order = [0]  # Start with first point
        visited[0] = True
        
        for _ in range(1, n_points):
            last_idx = order[-1]
            last_point = points[last_idx]
            
            # Find nearest unvisited point
            min_dist = float('inf')
            min_idx = -1
            
            for i in range(n_points):
                if not visited[i]:
                    dist = np.linalg.norm(last_point - points[i])
                    if dist < min_dist:
                        min_dist = dist
                        min_idx = i
            
            order.append(min_idx)
            visited[min_idx] = True
        
        return order
    
    def calculate_route_distance(self, route_points):
        """Calculate total distance of a route"""
        total_distance = 0
        for i in range(len(route_points) - 1):
            # Haversine formula for distance in km
            lat1, lon1 = route_points[i]
            lat2, lon2 = route_points[i + 1]
            
            R = 6371  # Earth's radius in km
            
            lat1_rad = np.radians(lat1)
            lat2_rad = np.radians(lat2)
            delta_lat = np.radians(lat2 - lat1)
            delta_lon = np.radians(lon2 - lon1)
            
            a = np.sin(delta_lat/2)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(delta_lon/2)**2
            c = 2 * np.arcsin(np.sqrt(a))
            
            total_distance += R * c
        
        return total_distance
    
    def save_model(self, path='ml_models/route_optimizer.pkl'):
        os.makedirs('ml_models', exist_ok=True)
        joblib.dump(self, path)
    
    @staticmethod
    def load_model(path='ml_models/route_optimizer.pkl'):
        return joblib.load(path)
