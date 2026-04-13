import json
import random

class GISService:
    """GIS and Population Data Service"""
    
    # Population density data for different areas (people per sq km)
    AREA_DATA = {
        'Islamabad': {
            'population': 1015000,
            'density': 2090,
            'waste_per_capita': 0.45,  # kg per day
            'high_density_zones': ['F-7', 'F-8', 'G-7', 'I-8'],
            'coordinates': {'lat': 33.6844, 'lng': 73.0479}
        },
        'Karachi': {
            'population': 14910000,
            'density': 6300,
            'waste_per_capita': 0.52,
            'high_density_zones': ['Clifton', 'Defence', 'Gulshan', 'North Nazimabad'],
            'coordinates': {'lat': 24.8607, 'lng': 67.0011}
        },
        'Lahore': {
            'population': 11126000,
            'density': 5400,
            'waste_per_capita': 0.48,
            'high_density_zones': ['Gulberg', 'Model Town', 'Johar Town', 'DHA'],
            'coordinates': {'lat': 31.5497, 'lng': 74.3436}
        }
    }
    
    @staticmethod
    def get_population_data(area):
        """Get population and demographic data for area"""
        data = GISService.AREA_DATA.get(area, GISService.AREA_DATA['Islamabad'])
        
        # Calculate estimated daily waste
        estimated_waste = data['population'] * data['waste_per_capita'] / 1000  # tons
        
        return {
            'area': area,
            'population': data['population'],
            'population_density': data['density'],
            'waste_per_capita': data['waste_per_capita'],
            'estimated_daily_waste': round(estimated_waste, 2),
            'high_density_zones': data['high_density_zones'],
            'coordinates': data['coordinates']
        }
    
    @staticmethod
    def get_nearby_areas(lat, lng, radius_km=5):
        """Find nearby areas within radius"""
        # Mock implementation - in production, use actual GIS database
        areas = []
        for area_name, data in GISService.AREA_DATA.items():
            # Calculate rough distance (simplified)
            lat_diff = abs(data['coordinates']['lat'] - lat)
            lng_diff = abs(data['coordinates']['lng'] - lng)
            distance = (lat_diff * 111) + (lng_diff * 85)  # Rough km estimate
            
            if distance <= radius_km:
                areas.append({
                    'area': area_name,
                    'distance_km': round(distance, 2),
                    'population': data['population'],
                    'density': data['density']
                })
        
        return sorted(areas, key=lambda x: x['distance_km'])
    
    @staticmethod
    def get_waste_prediction_factors(area):
        """Get factors for waste prediction based on GIS data"""
        data = GISService.get_population_data(area)
        
        return {
            'base_waste': data['estimated_daily_waste'],
            'density_factor': data['population_density'] / 1000,
            'population_growth_rate': 2.5,  # percent per year
            'seasonal_factor': 1.2 if area == 'Karachi' else 1.0,
            'urbanization_rate': 3.0
        }

gis_service = GISService()
