import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json

class CompleteDataGenerator:
    def __init__(self):
        self.cities = {
            'Karachi': {'lat': 24.8607, 'lng': 67.0011, 'areas': ['Clifton', 'Defence', 'Gulshan', 'North Nazimabad', 'Korangi']},
            'Lahore': {'lat': 31.5497, 'lng': 74.3436, 'areas': ['Gulberg', 'Johar Town', 'Model Town', 'DHA', 'Iqbal Town']},
            'Islamabad': {'lat': 33.6844, 'lng': 73.0479, 'areas': ['F-6', 'F-7', 'G-10', 'I-8', 'E-11']}
        }
        
        self.sensitive_locations = [
            {'name': 'School', 'lat_range': (24.85, 24.87), 'lng_range': (67.00, 67.02)},
            {'name': 'Hospital', 'lat_range': (24.86, 24.88), 'lng_range': (67.01, 67.03)},
            {'name': 'Mosque', 'lat_range': (24.84, 24.86), 'lng_range': (67.00, 67.02)}
        ]
    
    def generate_complaint_dataset(self, n_samples=10000):
        """Generate realistic complaint dataset"""
        
        data = []
        complaint_types = ['overflowing', 'missed', 'illegal', 'spillage', 'other']
        weather_conditions = ['clear', 'rainy', 'cloudy', 'hot', 'cold']
        
        for i in range(n_samples):
            city = random.choice(list(self.cities.keys()))
            area = random.choice(self.cities[city]['areas'])
            
            # Generate coordinates
            base_lat = self.cities[city]['lat'] + random.uniform(-0.05, 0.05)
            base_lng = self.cities[city]['lng'] + random.uniform(-0.05, 0.05)
            
            # Check if near sensitive area
            near_sensitive = 0
            for sensitive in self.sensitive_locations:
                if (sensitive['lat_range'][0] <= base_lat <= sensitive['lat_range'][1] and
                    sensitive['lng_range'][0] <= base_lng <= sensitive['lng_range'][1]):
                    near_sensitive = 1
                    break
            
            # Generate features
            complaint_type = random.choice(complaint_types)
            day_of_week = random.choice(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
            weather = random.choice(weather_conditions)
            
            population_density = random.uniform(1000, 20000)
            distance_to_bin = random.uniform(0.1, 5.0)
            hours_since_collection = random.randint(1, 72)
            
            # Determine priority based on realistic rules
            if near_sensitive == 1 and hours_since_collection > 24:
                priority = 'urgent'
            elif complaint_type == 'overflowing' and hours_since_collection > 48:
                priority = 'high'
            elif complaint_type == 'illegal':
                priority = 'high'
            elif hours_since_collection > 36:
                priority = 'high'
            elif hours_since_collection > 24:
                priority = 'medium'
            else:
                priority = 'low'
            
            data.append({
                'complaint_id': i + 1,
                'city': city,
                'area': area,
                'latitude': base_lat,
                'longitude': base_lng,
                'complaint_type': complaint_type,
                'day_of_week': day_of_week,
                'weather': weather,
                'population_density': population_density,
                'distance_to_bin_km': distance_to_bin,
                'hours_since_last_collection': hours_since_collection,
                'near_sensitive_area': near_sensitive,
                'priority': priority
            })
        
        df = pd.DataFrame(data)
        df.to_csv('complete_complaint_dataset.csv', index=False)
        print(f"✅ Generated {n_samples} complaint records")
        
        # Generate statistics
        stats = {
            'total_complaints': len(df),
            'priority_distribution': df['priority'].value_counts().to_dict(),
            'type_distribution': df['complaint_type'].value_counts().to_dict(),
            'city_distribution': df['city'].value_counts().to_dict()
        }
        
        with open('dataset_statistics.json', 'w') as f:
            json.dump(stats, f, indent=2)
        
        return df, stats
    
    def generate_waste_data(self, n_days=730):
        """Generate 2 years of waste data"""
        
        dates = [datetime.now() - timedelta(days=x) for x in range(n_days)]
        dates.reverse()
        
        data = []
        
        for city in self.cities.keys():
            for area in self.cities[city]['areas']:
                base_waste = random.uniform(200, 800)
                
                for date in dates:
                    # Base waste
                    waste = base_waste
                    
                    # Day of week effect
                    day_of_week = date.strftime('%A')
                    if day_of_week in ['Saturday', 'Sunday']:
                        waste *= 1.3
                    
                    # Seasonal effect
                    month = date.month
                    if month in [6, 7, 8]:
                        waste *= 1.2
                    elif month in [12, 1, 2]:
                        waste *= 0.8
                    
                    # Weekend before holidays
                    if day_of_week == 'Friday' and 20 <= date.day <= 25:
                        waste *= 1.5
                    
                    # Random variation
                    waste += random.uniform(-50, 50)
                    
                    data.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'city': city,
                        'area': area,
                        'waste_kg': max(0, round(waste, 2))
                    })
        
        df = pd.DataFrame(data)
        df.to_csv('complete_waste_data.csv', index=False)
        print(f"✅ Generated {len(df)} waste records")
        
        return df

if __name__ == "__main__":
    generator = CompleteDataGenerator()
    
    print("🚀 Generating Complete Dataset for CleanRoute-AI")
    print("=" * 50)
    
    complaint_df, stats = generator.generate_complaint_dataset(10000)
    waste_df = generator.generate_waste_data(730)
    
    print("\n📊 Dataset Statistics:")
    print(json.dumps(stats, indent=2))
    
    print("\n✅ Dataset generation complete!")
    print("Files created:")
    print("  - complete_complaint_dataset.csv")
    print("  - complete_waste_data.csv")
    print("  - dataset_statistics.json")